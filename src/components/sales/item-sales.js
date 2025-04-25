import NoData from "@/components/reporting/no-data";
import moment from "moment";
import { Table } from "rsuite";
import "rsuite/Table/styles/index.css";
import { FILTERS } from "@/utils/helper";
import Paginate from "../paginate";
import Button from "../ui/button";
import { FaFileExport } from "react-icons/fa";
import { getExportCSVData } from "@/utils/csv_downloader";
import CSpinner from "../common/CSpinner";
import { useState } from "react";

const { Column, HeaderCell, Cell } = Table;
export default function ItemSales({
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

  if (!data || data.length <= 0) {
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
  return (
    <>
      <div className="flex justify-between w-full items-center mb-[10px] relative">
        <h2 className="mb-[10px]">
          {moment(dateRange[0]).format("MMM D, YYYY") +
            "-" +
            moment(dateRange[1]).format("MMM D, YYYY")}
        </h2>
        <div className=" relative">
          <Button
            onClick={() => {
              if (exportLoading == true) return;
              getExportCSVData(
                merchant,
                FILTERS.item_sales,
                dateRange,
                timeRange,
                `item_sales_${moment(dateRange[0]).format(
                  "MMM-D-YYYY"
                )}_${moment(dateRange[1]).format("MMM-D-YYYY")}`,
                setExportLoading
              );
            }}
          >
            {exportLoading == true ? (
              <>
                <CSpinner color="text-[#055938]" />
              </>
            ) : (
              <FaFileExport color="#055938" />
            )}
          </Button>
        </div>
      </div>

      {/* <BasicLineChartMultiple
        data={otherData?.salesGraph}
        categoryKey="order_date_d"
        seriesKey={["total_sales,Total Gross"]}
        currencySymbol={merchant?.currency?.symbol || <>&euro;</>}
        isMultiMonth={isSpanningMoreThanOneMonth(dateRange)}
        isMultiData={true}
      /> */}
      <Table autoHeight width="100%" data={data} onRowClick={(rowData) => {}}>
        <Column flexGrow={1} fixed>
          <HeaderCell>Item</HeaderCell>
          <Cell dataKey="menu_item_name" />
        </Column>

        <Column flexGrow={1}>
          <HeaderCell>Category</HeaderCell>
          <Cell dataKey="menu_category_name" />
        </Column>

        <Column flexGrow={1}>
          <HeaderCell>Item Sold</HeaderCell>
          <Cell dataKey="total_item_sold" />
        </Column>

        <Column flexGrow={1}>
          <HeaderCell>Gross Sale</HeaderCell>
          <CurrencyCell dataKey="total_sales" />
        </Column>
      </Table>

      {loading == true ? (
        <div className="w-full justify-center items-center flex mt-[10px]">
          <CSpinner color="text-black !w-[50px] !h-[50px]" />
        </div>
      ) : metaData && metaData?.total > 0 ? (
        <Paginate
          isLoadMore={true}
          metaData={metaData}
          setPageCurrent={setPageCurrent}
        />
      ) : (
        <></>
      )}
    </>
  );
}
