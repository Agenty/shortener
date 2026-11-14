import _ from 'lodash';

/** Google Safe Browsing threat types, see https://developers.google.com/safe-browsing/v4/reference/rest/v4/ThreatType */
export enum ThreatType {
  MALWARE = 'MALWARE',
  SOCIAL_ENGINEERING = 'SOCIAL_ENGINEERING',
  UNWANTED_SOFTWARE = 'UNWANTED_SOFTWARE',
  POTENTIALLY_HARMFUL_APPLICATION = 'POTENTIALLY_HARMFUL_APPLICATION',
}

export const THREAT_LABELS: Record<string, string> = {
  [ThreatType.MALWARE]: 'Malware',
  [ThreatType.SOCIAL_ENGINEERING]: 'Phishing or deceptive site',
  [ThreatType.UNWANTED_SOFTWARE]: 'Unwanted software',
  [ThreatType.POTENTIALLY_HARMFUL_APPLICATION]: 'Potentially harmful application',
};

/** Max threat entries per threatMatches:find request */
const MAX_ENTRIES = 500;

type ThreatMatch = { threatType: string; threat: { url: string } };

export const isSafeBrowsingEnabled = (env: CloudflareBindings) =>
  !!env.GOOGLE_SAFEBROWSE_KEY;

/**
 * Looks up URLs in the Google Safe Browsing Lookup API (v4) and returns the
 * threat type of each unsafe URL. URLs not in the map are safe. Throws when
 * the API fails, so a queue message is retried instead of marked as checked
 */
export const findThreats = async (
  env: CloudflareBindings,
  urls: Array<string>
): Promise<Map<string, string>> => {
  const threats = new Map<string, string>();
  if (!isSafeBrowsingEnabled(env)) return threats;

  for (const chunk of _.chunk(_.uniq(urls), MAX_ENTRIES)) {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${env.GOOGLE_SAFEBROWSE_KEY}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          client: { clientId: 'shortener.dev', clientVersion: '1.0.0' },
          threatInfo: {
            threatTypes: Object.values(ThreatType),
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: chunk.map((url) => ({ url })),
          },
        }),
      }
    );
    if (!res.ok) {
      throw new Error(
        `Safe Browsing lookup failed: ${res.status} ${await res.text()}`
      );
    }
    const { matches = [] }: { matches?: Array<ThreatMatch> } = await res.json();
    for (const match of matches) {
      threats.set(match.threat.url, match.threatType);
    }
  }
  return threats;
};
