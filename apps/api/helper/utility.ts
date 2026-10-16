import { ZodError, ZodIssue } from 'zod';
import { Link } from '../models/link';
import { getUnixTime } from 'date-fns';

export const isValidUrl = (url: string) => {
  if (!url || !url.length) return false;
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const slugify = (str: string) => {
  str = str.replace(/^\s+|\s+$/g, '');
  str = str.toLowerCase();
  str = str
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return str;
};

export const md5 = async (value: string) => {
  const encodedText = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest({ name: 'MD5' }, encodedText);
  // Convert the digest to a hexadecimal string
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const escapeSQL = (str: string) => {
  if (!str) return;
  return str.replace(/'/g, "''"); // Escape single quotes by doubling them
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = 'sadfasdghjyt45645t';
  const utf8 = new TextEncoder().encode(`${salt}:${password}`);

  const hashBuffer = await crypto.subtle.digest({ name: 'SHA-256' }, utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
};

export const getFileExtension = (path: string) => {
  const pathSegments = path.split('?')[0].split('.');
  if (pathSegments.length > 1) {
    return pathSegments.pop();
  }
};

export const removeDomainInPaths = (openapiSpec: any) => {
  if (!openapiSpec || !openapiSpec.paths) {
    return openapiSpec;
  }

  Object.keys(openapiSpec.paths).forEach((path) => {
    const modifiedPath = path.replace('/api.shortener.dev/v1/', '/');
    if (modifiedPath !== path) {
      openapiSpec.paths[modifiedPath] = openapiSpec.paths[path];
      delete openapiSpec.paths[path];
    }
  });

  return openapiSpec;
};

const formatZodIssue = (issue: ZodIssue): string => {
  const { path, message } = issue;
  const pathString = path.join('.');
  return `${pathString}: ${message}`;
};

export const formatZodError = (error: ZodError): string => {
  const { issues } = error;
  if (issues.length) {
    const currentIssue = issues[0];
    return formatZodIssue(currentIssue);
  }
};

export const generateMd5 = async (value: string) => {
  const msgUint8 = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest('MD5', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const getExpiration = (link: Link) => {
  if (!link.expire_at) return;
  const expireAt = link.expire_at ? getUnixTime(new Date(link.expire_at)) : undefined;
  return expireAt > 2147483647 ? undefined : expireAt;
};

export const getRandomColor = () => {
  const colorsArray = [
    '#ffe4e6',
    '#fce7f3',
    '#ede9fe',
    '#e0f2fe',
    '#ccfbf1',
    '#dcfce7',
    '#ecfccb',
    '#fef3c7',
    '#ffedd5',
    '#fee2e2',
    '#f1f5f9',
  ];

  const random = Math.floor(Math.random() * colorsArray.length);
  return colorsArray[random];
};

export const toISOformat = (value: string | null) => {
  if (!value) return;
  return value.endsWith('Z') ? value : value.replace(' ', 'T') + 'Z';
};

export const cleanUri = (url: string) => {
  if (!url) return;
  return url.replace('https://', '').replace('http://', '').split('?')[0];
};
