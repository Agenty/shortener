import { Link } from './link';

export interface SiteData {
  meta: MetaData;
  children?: JSX.Element | JSX.Element[];
  links?: Array<Link>;
  article?: Article;
  schema?: string;
  script?: string;
  prod?: boolean;
}

export interface MetaData {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  country?: unknown | string;
}

export interface Article {
  categories: Array<any>;
  title?: string;
  content?: string;
  posts?: Array<any>;
}
