import { describe, expect, it, vi } from "vitest";
import { fetchAllPages, toCsv } from "./csv";

describe("toCsv", () => {
  const columns = [
    { header: "a", value: (r: { a?: string | number | null }) => r.a },
  ];

  it("quotes commas, quotes and line breaks", () => {
    expect(toCsv([{ a: "x,y" }, { a: 'say "hi"' }, { a: "two\nlines" }], columns)).toBe(
      'a\r\n"x,y"\r\n"say ""hi"""\r\n"two\nlines"',
    );
  });

  it("keeps cells that look like formulas as text", () => {
    expect(toCsv([{ a: "=HYPERLINK(1)" }, { a: "+1" }, { a: "@sum" }, { a: "-2" }], columns)).toBe(
      "a\r\n'=HYPERLINK(1)\r\n'+1\r\n'@sum\r\n'-2",
    );
  });

  it("writes numbers as they are and empty values as empty cells", () => {
    expect(toCsv([{ a: -5 }, { a: null }, {}], columns)).toBe("a\r\n-5\r\n\r\n");
  });
});

describe("fetchAllPages", () => {
  it("reads pages until one comes back short", async () => {
    const fetchPage = vi.fn(async (offset: number, limit: number) => {
      const result = Array.from({ length: Math.max(0, Math.min(limit, 5 - offset)) }, (_, i) => offset + i);
      return { returned: result.length, result };
    });
    expect(await fetchAllPages(fetchPage, 2)).toEqual([0, 1, 2, 3, 4]);
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });

  it("makes one more request when the last page is exactly full", async () => {
    const fetchPage = vi.fn(async (offset: number) =>
      offset < 4 ? { returned: 2, result: [offset, offset + 1] } : { returned: 0, result: [] },
    );
    expect(await fetchAllPages(fetchPage, 2)).toEqual([0, 1, 2, 3]);
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });
});
