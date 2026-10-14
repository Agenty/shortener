export class TableResult {
  total: number = 0;
  limit: number = 25;
  offset: number = 0;
  returned: number = 0;
  result: any[] = [];

  constructor(
    result: any[] = [],
    offset: number = 0,
    limit: number = 25,
    total: number = 0,
    returned: number = 0
  ) {
    this.result = result;
    this.total = total || result.length;
    this.limit = limit;
    this.offset = offset;
    this.returned = returned || result.length;
  }
}
