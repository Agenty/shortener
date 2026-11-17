/** Column of a CSV export: a header and how to read the value from a row */
export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

/**
 * Spreadsheet apps run cells that start with these characters as formulas.
 * Referrers, cities and destinations come from visitors and link creators,
 * so prefix them with an apostrophe to keep them as plain text.
 */
const FORMULA_START = /^[=+\-@\t\r]/;

const escapeCell = (input: string | number | boolean | null | undefined) => {
  if (input === null || input === undefined) return "";
  let value = String(input);
  if (typeof input === "string" && FORMULA_START.test(value)) value = `'${value}`;
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
};

export const toCsv = <T>(rows: T[], columns: CsvColumn<T>[]) =>
  [
    columns.map((c) => escapeCell(c.header)).join(","),
    ...rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(",")),
  ].join("\r\n");

/** Save a CSV file in the browser. The BOM makes Excel read UTF-8 city names correctly */
export const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** `links-2026-11-17.csv` */
export const datedFilename = (name: string) => `${name}-${new Date().toISOString().slice(0, 10)}.csv`;

/**
 * Read every page of a paginated endpoint. Stops on a short page rather than
 * trusting `total`, which the links list doesn't narrow down by search.
 */
export async function fetchAllPages<T>(
  fetchPage: (offset: number, limit: number) => Promise<{ returned: number; result: T[] }>,
  limit = 1000,
  max = 100_000,
): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; offset < max; offset += limit) {
    const page = await fetchPage(offset, limit);
    rows.push(...page.result);
    if (page.returned < limit) break;
  }
  return rows;
}
