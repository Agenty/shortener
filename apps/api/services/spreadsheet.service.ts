import { textToJson } from '../helper/textParser';
import { slugify } from '../helper/utility';
import { Bindings } from '../types/bindings';

export const getCompetitors = async (env: Bindings) => {
  const cacheKey = `competitors-${env.DOMAIN}`;
  const value = await env.KVCACHE.get(cacheKey, {
    type: 'json',
    cacheTtl: 3600,
  });
  if (value) return value;

  const r = await fetch(
    `https://docs.google.com/spreadsheets/d/1Jmjd53yUu1EyXfcmYvcfkSyVR9HaKsLPx7HdrbTA0Gc/gviz/tq?tqx=out:csv&sheet=Sheet1`
  );
  if (r.ok) {
    const text = await r.text();
    const json = await textToJson(text, 'csv', ',');
    const result = json.map((x) => ({
      ...x,
      path:
        x.name == 'Idm.in'
          ? '#'
          : `/alternatives/${slugify(x.name)}-alternative`,
    }));

    if (result.length) {
      await env.KVCACHE.put(cacheKey, JSON.stringify(result), {
        expirationTtl: 60 * 60 * 24,
      });
    }
    return result;
  }
  return null;
};

export const getCompetitor = async (env: Bindings, competitor: string) => {
  const list = await getCompetitors(env);
  return list.find((x) => x.path.endsWith(competitor));
};

export const getComparison = async (env: Bindings, competitor: string) => {
  competitor = competitor.toLowerCase();
  const cacheKey = `comparison-${env.DOMAIN}-${competitor}`;
  const cachedValue: Array<any> = await env.KVCACHE.get(cacheKey, {
    type: 'json',
    cacheTtl: 3600,
  });
  if (cachedValue) {
    cachedValue.forEach((x) => {
      x.comparewith = x[competitor];
    });
    return cachedValue;
  }

  const r = await fetch(
    `https://docs.google.com/spreadsheets/d/1Jmjd53yUu1EyXfcmYvcfkSyVR9HaKsLPx7HdrbTA0Gc/gviz/tq?tqx=out:csv&sheet=Comparison`
  );
  if (r.ok) {
    const text = await r.text();
    const result = await textToJson(text, 'csv', ',');
    if (result) {
      await env.KVCACHE.put(cacheKey, JSON.stringify(result), {
        expirationTtl: 60 * 60 * 24,
      });
      result.forEach((x) => {
        x.comparewith = x[competitor];
      });
      return result;
    }
  }
  return [];
};
