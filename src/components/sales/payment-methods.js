import ColorHeadingTitle from "@/components/reporting/color-heading-title";
import NoData from "@/components/reporting/no-data";
import TableItem from "@/components/reporting/table-item";
import { ORDER_FILTERS_BY, paid_by } from "@/utils/constants";
import moment from "moment";
import { useRouter } from "next/navigation";
export default function PaymentMethods({
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
  const data_r = data?.orderData;

  const total_cash_orders = data_r?.total_cash_orders;
  const cash_total_amount = data_r?.cash_total_amount;

  const total_card_orders = data_r?.total_card_orders;
  const card_total_amount = data_r?.card_total_amount;

  const total_foc_orders = +data_r?.total_foc_orders;
  const total_foc_amount = +data_r?.total_foc_amount;

  const total_orders = total_cash_orders + total_card_orders + total_foc_orders;

  const cash_counter = ((total_cash_orders / total_orders) * 100).toFixed(2);
  const card_counter = ((total_card_orders / total_orders) * 100).toFixed(2);
  const foc_counter = ((total_foc_orders / total_orders) * 100).toFixed(2);

  if (!data_r) {
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
      <h2>
        {moment(dateRange[0]).format("MMM D, YYYY") +
          "-" +
          moment(dateRange[1]).format("MMM D, YYYY")}
      </h2>
      <div className="flex gap-4 mt-8">
        <div
          className={`h-[10px] bg-[#72D542]`}
          style={{ width: cash_counter + "%" }}
        ></div>
        <div
          className={`h-[10px] bg-[#44D35B]`}
          style={{ width: card_counter + "%" }}
        ></div>
        <div
          className={`h-[10px] bg-[#348708]`}
          style={{ width: foc_counter + "%" }}
        ></div>
      </div>
      <ColorHeadingTitle
        isClickable={true}
        onClick={() => {
          router.push(
            `/sales/reports/data?filter=${ORDER_FILTERS_BY.order_paid_by}&filter_value=${paid_by.cash}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}&pageName=Cash`
          );
        }}
        color={"bg-[#72D542]"}
        title={`Cash ${total_cash_orders > 0 ? `(${total_cash_orders})` : ""}`}
        value={
          cash_counter > 0
            ? `${cash_counter}% (${contentwithSymbol(cash_total_amount)})`
            : contentwithSymbol(cash_total_amount)
        }
      />
      <ColorHeadingTitle
        isClickable={true}
        onClick={() => {
          router.push(
            `/sales/reports/data?filter=${ORDER_FILTERS_BY.order_paid_by}&filter_value=${paid_by.card}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}&pageName=Card`
          );
        }}
        color={"bg-[#44D35B]"}
        title={`Card ${total_card_orders > 0 ? `(${total_card_orders})` : ""}`}
        value={
          card_counter > 0
            ? `${card_counter}% (${contentwithSymbol(card_total_amount)})`
            : contentwithSymbol(card_total_amount)
        }
      />
      <ColorHeadingTitle
        isClickable={true}
        onClick={() => {
          router.push(
            `/sales/reports/data?filter=${ORDER_FILTERS_BY.order_paid_by}&filter_value=${paid_by.foc}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}&pageName=FOC`
          );
        }}
        color={"bg-[#348708]"}
        title={`FOC ${total_foc_orders > 0 ? `(${total_foc_orders})` : ""}`}
        value={
          foc_counter > 0
            ? `${foc_counter}% (${contentwithSymbol(total_foc_amount)})`
            : contentwithSymbol(total_foc_amount)
        }
      />
      <div>
        <TableItem
          className={"pl-[5px]"}
          heading="Card Sales"
          isFirstItem={true}
          isHeading={true}
        />
        <TableItem
          className={"pl-[5px]"}
          heading="Payments"
          isIndent={true}
          content={total_card_orders}
        />
        <TableItem
          className={"pl-[5px]"}
          heading="Payment Amount"
          isIndent={true}
          content={contentwithSymbol(card_total_amount)}
        />
        <TableItem
          className={"pl-[5px]"}
          heading="Net Amount"
          isLastItem={true}
          isMainItem={true}
          content={contentwithSymbol(card_total_amount)}
        />
      </div>
      <div>
        <TableItem
          className={"pl-[5px]"}
          heading="Cash Sales"
          isFirstItem={true}
          isHeading={true}
        />
        <TableItem
          className={"pl-[5px]"}
          heading="Payments"
          isIndent={true}
          content={total_cash_orders}
        />
        <TableItem
          className={"pl-[5px]"}
          heading="Payment Amount"
          isIndent={true}
          content={contentwithSymbol(cash_total_amount)}
        />
        <TableItem
          className={"pl-[5px]"}
          heading="Net Amount"
          isLastItem={true}
          isMainItem={true}
          content={contentwithSymbol(cash_total_amount)}
        />
      </div>
      <div>
        <TableItem
          className={"pl-[5px]"}
          heading="F.O.C"
          isFirstItem={true}
          isHeading={true}
        />
        <TableItem
          className={"pl-[5px]"}
          heading="Total F.O.C's"
          isIndent={true}
          content={total_foc_orders}
        />
        <TableItem
          className={"pl-[5px]"}
          heading="Payment Amount"
          isLastItem={true}
          isMainItem={true}
          content={contentwithSymbol(total_foc_amount)}
        />
      </div>
    </>
  );
}
