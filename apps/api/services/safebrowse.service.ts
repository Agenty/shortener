import { HTTPException } from 'hono/http-exception';
import { Bindings } from '../types/bindings';
import { ScanRequest } from '../models/scanRequest';
import { generateMd5 } from '../helper/utility';
import { StatusCode } from 'hono/utils/http-status';

export const safebrowsingCheck = async (env: Bindings, url: string) => {
  const cacheKey = await generateMd5(url.split('?')[0]);
  const cacheValue: any = await env.KVCACHE.get(cacheKey, {
    type: 'json',
    cacheTtl: 60,
  });
  if (cacheValue) {
    return cacheValue.result;
  }

  const options = {
    threatInfo: {
      threatTypes: [
        'MALWARE',
        'SOCIAL_ENGINEERING',
        'UNWANTED_SOFTWARE',
        'POTENTIALLY_HARMFUL_APPLICATION',
        'THREAT_TYPE_UNSPECIFIED',
      ],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [
        {
          url: url,
        },
      ],
      //   [
      //     {
      //       url: 'http://testsafebrowsing.appspot.com/apiv4/ANY_PLATFORM/MALWARE/URL/',
      //     },
      //   ],
    },
  };
  const r = new Request(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${env.GOOGLE_SAFEBROWSE_KEY}`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(options),
    }
  );
  let matchingUrls = [];
  const resp = await fetch(r);
  if (resp.status == 200) {
    const data: any = await resp.json();
    matchingUrls = data.hasOwnProperty('matches')
      ? data.matches.map((m: any) => m.threat.url)
      : [];
  }
  const isThreat = matchingUrls.includes(url);
  await env.KVCACHE.put(cacheKey, JSON.stringify({ result: isThreat }), {
    expirationTtl: 60 * 15,
  });
  return isThreat;
};

export const virustotalScanner = async (url: string, env: Bindings) => {
  const r = new Request(`https://www.virustotal.com/api/v3/urls`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'x-apikey': env.VIRUSTOTAL_APIKEY,
    },
    body: new URLSearchParams({
      url: url,
    }),
  });

  const resp = await fetch(r);
  const json: any = await resp.json();

  if (resp.status != 200) {
    throw new HTTPException(resp.status as StatusCode, {
      message: json.error?.message,
    });
  }
  const { id } = json.data;
  return id;
};

export const virustotalAnalysis = async (id: string, env: Bindings) => {
  const r = new Request(`https://www.virustotal.com/api/v3/analyses/${id}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'x-apikey': env.VIRUSTOTAL_APIKEY,
    },
  });

  const resp = await fetch(r);
  const json: any = await resp.json();

  if (resp.status != 200) {
    throw new HTTPException(resp.status as StatusCode, {
      message: json.error?.message,
    });
  }
  console.log('/v3/analyses', json);
  return json.data;
};

export const getAnalysisWithRetry = async (
  scanRequest: ScanRequest,
  env: Bindings,
  maximumRetry = 10,
  delay = 1000
) => {
  let retryCount = 0;
  let analysis: any;

  do {
    analysis = await virustotalAnalysis(scanRequest.vt_id, env);
    if (!analysis.attributes || analysis.attributes.status !== 'queued') {
      break; // Exit the loop if analysis status is not 'queued'
    }
    // Retry delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    retryCount++;
  } while (retryCount < maximumRetry);

  return analysis;
};
