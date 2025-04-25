import { getRequest } from "./apiFunctions";
import { getErrorMessageFromResponse } from "./helper";

const csvDownloader = (array, name, headers = null) => {
  // Use provided headers or extract keys from the array of objects
  const keys =
    headers || Array.from(new Set(array.flatMap((obj) => Object.keys(obj))));
  const csvContent =
    keys.join(",") +
    "\n" +
    array
      .map(
        (obj) =>
          keys.map((key) => (obj[key] !== undefined ? obj[key] : "")).join(",") // Map keys to values, using empty string if undefined
      )
      .join("\n");

  const csvBlob = new Blob([csvContent], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(csvBlob);

  const link = document.createElement("a");
  link.href = csvUrl;
  link.setAttribute("download", `${name}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const csvDownloaderNew = (array, name) => {
  // Extracting all unique keys from all objects
  const keys = Array.from(new Set(array.flatMap((obj) => Object.keys(obj))));

  // Creating CSV content with proper key and value handling
  const csvContent =
    keys.join(",") + // Headers
    "\n" +
    array
      .map((obj) => keys.map((key) => `"${obj[key] ?? ""}"`).join(","))
      .join("\n");

  // Creating Blob
  const csvBlob = new Blob([csvContent], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(csvBlob);

  // Creating anchor element and triggering download
  const link = document.createElement("a");
  link.href = csvUrl;
  link.setAttribute("download", `${name}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function getExportCSVData(
  merchant,
  filter,
  dateRange,
  timeRange,
  name,
  setExportLoading,
  exportUrl = null
) {
  setExportLoading(true);
  const filters = `?filter=${filter}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}`;
  let url =
    exportUrl == null
      ? `/merchant/${merchant?.id}/get/exported/data${filters}`
      : `/merchant/${merchant?.id}` + exportUrl + filters;

  if (timeRange?.timeStart && timeRange?.timeEnd) {
    url = url.concat(
      `&timeStart=${timeRange?.timeStart}&timeEnd=${timeRange?.timeEnd}`
    );
  }
  getRequest(url)
    .then((res) => {
      const data = res?.data;
      const { graphData } = data;
      csvDownloader(graphData, name);
    })
    .catch((err) => getErrorMessageFromResponse(err))
    .finally(() => {
      setExportLoading(false);
    });
}

function fetchDataToExport({ setExportLoading, exportUrl, name }) {
  setExportLoading(true);
  getRequest(exportUrl)
    .then((res) => {
      const data = res?.data;
      csvDownloader(data, name);
    })
    .catch((err) => getErrorMessageFromResponse(err))
    .finally(() => {
      setExportLoading(false);
    });
}

function fetchDataToExportTitles({ setExportLoading, exportUrl, name }) {
  setExportLoading(true);
  const data = ["menu_item_name", "menu_category_name", "menu_item_price"];
  csvDownloader([], name, data);
  setExportLoading(false);
}

export {
  csvDownloader,
  getExportCSVData,
  csvDownloaderNew,
  fetchDataToExport,
  fetchDataToExportTitles,
};
