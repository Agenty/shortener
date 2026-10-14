import Papa from 'papaparse';

// Convert CSV or TSV text to JSON
const textParser = async (text: string, delimiter: string = ',') => {
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      delimiter,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header, index) => header.toLowerCase(),
      complete: (results) => {
        if (results.errors.length) {
          return reject(results.errors[0].message);
        }
        resolve(results.data);
      },
    });
  });
};

export const textToJson = async (
  text: string,
  fileType: string,
  delimiter?: string
) => {
  let jsonData: any;
  switch (fileType) {
    case 'csv':
    case 'tsv':
      jsonData = await textParser(
        text,
        delimiter || (fileType === 'tsv' ? '\t' : ',')
      );
      break;
    case 'json':
      jsonData = JSON.parse(text);
      break;
    default:
      throw new Error('Unsupported file type, must be CSV, TSV or JSON');
  }
  return jsonData;
};
