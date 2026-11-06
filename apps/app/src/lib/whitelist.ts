/** Public GitHub issue form asking to whitelist a domain for every account */
export const whitelistRequestUrl = (domain: string) => {
  const params = new URLSearchParams({
    template: 'whitelist.yml',
    title: `Whitelist request: ${domain}`,
    domain,
  });
  return `https://github.com/Agenty/shortener/issues/new?${params}`;
};
