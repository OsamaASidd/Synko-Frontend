import NoData from "@/components/reporting/no-data";
import moment from "moment";
import { Table } from "rsuite";
import "rsuite/Table/styles/index.css";
import { FILTERS, isSpanningMoreThanOneMonth } from "@/utils/helper";
import Paginate from "../paginate";
import Button from "../ui/button";
import { FaFileExport } from "react-icons/fa";
import { getExportCSVData } from "@/utils/csv_downloader";
import CSpinner from "../common/CSpinner";
import { useState } from "react";
import BasicLineChart from "../reporting/basic-line-chart";

const { Column, HeaderCell, Cell } = Table;
export default function RushHours({
  merchant,
  dateRange,
  data,
  contentwithSymbol,
  metaData,
  setPageCurrent,
  otherData,
  loading,
  timeRange,
}) {
  const [exportLoading, setExportLoading] = useState(false);

  const CurrencyCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
      {rowData[dataKey]
        ? `${contentwithSymbol(rowData[dataKey])}`
        : rowData[dataKey]}
    </Cell>
  );

  if (!data || data?.peakHours?.length <= 0 || data?.peakDays?.length <= 0) {
    return (
      <NoData>
        <h2 className="font-[500] text-[16px]">
          No Transactions in This Time Frame
        </h2>
        <p className="text-[12px]">
          No transactions took place during the time frame you selected.
        </p>
      </NoData>
    );
  }
  console.log("DATA");
  console.log(data);
  return (
    <>
      <div className="flex justify-between w-full items-center mb-[10px] relative">
        <h2 className="mb-[10px]">
          {moment(dateRange[0]).format("MMM D, YYYY") +
            "-" +
            moment(dateRange[1]).format("MMM D, YYYY")}
        </h2>
      </div>

      <div className="mb-[20px]">
        <h5>Peak Days</h5>
        <BasicLineChart
          data={data?.peakDays}
          categoryKey="order_date_d"
          seriesKey={["total_orders,Total Orders"]}
          currencySymbol={""}
          customCategories={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
          isMultiMonth={isSpanningMoreThanOneMonth(dateRange)}
        />
      </div>
      <div className="mb-[20px]">
        <h5>Peak Hours</h5>
        <BasicLineChart
          data={data?.peakHours}
          categoryKey="order_date_d"
          seriesKey={["total_orders,Total Orders"]}
          currencySymbol={""}
          customCategories={[
            "12AM",
            "1AM",
            "2AM",
            "3AM",
            "4AM",
            "5AM",
            "6AM",
            "7AM",
            "8AM",
            "9AM",
            "10AM",
            "11AM",
            "12PM",
            "1PM",
            "2PM",
            "3PM",
            "4PM",
            "5PM",
            "6PM",
            "7PM",
            "8PM",
            "9PM",
            "10PM",
            "11PM",
          ]}
          isMultiMonth={isSpanningMoreThanOneMonth(dateRange)}
        />
      </div>
    </>
  );
}
