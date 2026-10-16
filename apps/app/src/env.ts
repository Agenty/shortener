const local = {
  API_URL: "http://localhost:8787/v1",
};

const prod = {
  API_URL: "https://api.shortener.dev/v1",
};

export const env = import.meta.env.DEV ? local : prod;
