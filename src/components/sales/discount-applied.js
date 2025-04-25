import NoData from "@/components/reporting/no-data";
import moment from "moment";
import { Table } from "rsuite";
import "rsuite/Table/styles/index.css";
import CustomTimeRangePicker from "@/components/ui/custom-time-range-picker";
import { useRouter } from "next/navigation";
import { ORDER_FILTERS_BY } from "@/utils/constants";

const { Column, HeaderCell, Cell } = Table;

export default function DiscountApplied({
  merchant,
  currentReportPage,
  setCurrentReportPage,
  dateRange,
  setDateRange,
  data,
  setData,
  loading,
  setLoading,
  contentwithSymbol,
}) {
  const router = useRouter();
  const ClickableCell = ({ rowData, dataKey, ...props }) => {
    return (
      <Cell
        className="cursor-pointer"
        {...props}
        onClick={() => {
          //   if (dataKey == "total_orders") {
          //     router.push(
          //       `/sales/reports/data?filter=${ORDER_FILTERS_BY.discount}&filter_value=${rowData?.id}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}&pageName=Discount`
          //     );
          //   }
          //   console.log("Clicked cell:", dataKey);
          //   console.log("Row data:", rowData);
        }}
      >
        {rowData[dataKey]}
      </Cell>
    );
  };
  if (!data && data?.graphData?.length <= 0) {
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
      <h2 className="mb-[10px]">
        {moment(dateRange[0]).format("MMM D, YYYY") +
          "-" +
          moment(dateRange[1]).format("MMM D, YYYY")}
      </h2>
      <Table
        autoHeight
        width="100%"
        onRowClick={(rowData) => {
          if (rowData?.id) {
            router.push(
              `/sales/reports/data?filter=${ORDER_FILTERS_BY.discount}&filter_value=${rowData?.id}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}&pageName=Discount`
            );
          }
        }}
        data={data?.graphData}
      >
        <Column flexGrow={1} fixed>
          <HeaderCell>Discount</HeaderCell>
          <Cell className="cursor-pointer" dataKey="discount_name" />
        </Column>

        <Column flexGrow={1}>
          <HeaderCell>Discount Applied</HeaderCell>
          <ClickableCell dataKey="total_orders" />
        </Column>

        <Column flexGrow={1}>
          <HeaderCell># of Employee Applied this discount</HeaderCell>
          <ClickableCell dataKey="total_employee_applied" />
        </Column>
      </Table>
    </>
  );
}
