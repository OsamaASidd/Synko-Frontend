import NoData from "@/components/reporting/no-data";
import moment from "moment";
import { Table } from "rsuite";
import "rsuite/Table/styles/index.css";
import CustomTimeRangePicker from "@/components/ui/custom-time-range-picker";

const { Column, HeaderCell, Cell } = Table;

export default function EmployeeSales({
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
  const CurrencyCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
      {rowData[dataKey]
        ? `${contentwithSymbol(rowData[dataKey])}`
        : rowData[dataKey]}
    </Cell>
  );
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
        height={400}
        width="100%"
        data={data?.graphData}
        onRowClick={(rowData) => {}}
      >
        <Column flexGrow={1} minWidth={120}>
          <HeaderCell>Employee</HeaderCell>
          <Cell dataKey="name" />
        </Column>

        <Column flexGrow={1} minWidth={120}>
          <HeaderCell>Sold Items</HeaderCell>
          <Cell dataKey="total_orders" />
        </Column>

        <Column flexGrow={1} minWidth={120}>
          <HeaderCell>Gross Amount</HeaderCell>
          <CurrencyCell dataKey="gross_total" />
        </Column>

        <Column flexGrow={1} minWidth={120}>
          <HeaderCell>Discounts</HeaderCell>
          <CurrencyCell dataKey="total_discount" />
        </Column>

        <Column flexGrow={1} minWidth={120}>
          <HeaderCell>Amount</HeaderCell>
          <CurrencyCell dataKey="net_total" />
        </Column>
      </Table>
    </>
  );
}
