const DATA_PATH = "youtube-data.csv";

export async function getData() {
    const data_as_string = await fetchFile();
    const data_as_object = readStringIntoObject(data_as_string);
    return data_as_object;
}

export async function fetchFile() {
    try {
      const response = await fetch(DATA_PATH);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseBody = await response.text();
      return responseBody;
    } catch (error) {
      console.error('Error fetching CSV file:', error);
    }
  }
  

export function readStringIntoObject(data_as_string) {
    const lines = data_as_string.split('\n');
    const data = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        const row = {};
        const currentline = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = currentline[j];
        }

        data.push(row);
    }
    return data;
}
