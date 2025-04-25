import BasicLineChart from "@/components/reporting/basic-line-chart";
import NoData from "@/components/reporting/no-data";
import TableItem from "@/components/reporting/table-item";
import { getRequest } from "@/utils/apiFunctions";
import { ORDER_FILTERS_BY, order_type, paid_by } from "@/utils/constants";
import {
  debounce,
  getErrorMessageFromResponse,
  isSpanningMoreThanOneMonth,
} from "@/utils/helper";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

export default function SalesSummary({
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
  const totals_party = data?.partySales?.reduce(
    (acc, item) => {
      acc.total_orders += item?.total_orders || 0;
      acc.gross_total += item?.gross_total || 0;
      acc.total_discount += item?.total_discount || 0;
      acc.net_total += item?.net_total || 0;
      return acc;
    },
    {
      total_orders: 0,
      gross_total: 0,
      total_discount: 0,
      net_total: 0,
    }
  );

  const data_r = data?.orderData;
  const order_sources = data?.orderSources;

  const total_delivery_charges = +data_r?.total_delivery_charges;
  const total_service_charges = +data_r?.total_service_charges;
  const total_item_sales = +data_r?.total_gross;
  const total_gross =
    +data_r?.total_gross + total_delivery_charges + total_service_charges;

  const tax_amount = +data_r?.total_tax_amount || 0;
  const total_discount = +data_r?.total_discount || 0;

  const total_net_amount = total_gross - total_discount;
  const total = total_net_amount + tax_amount;

  const total_foc_orders = +data_r?.total_foc_orders;
  const total_foc_amount = +data_r?.total_foc_amount;
  const total_sales_return_amount = +data_r?.total_sales_return_amount;

  const total_takeaway_orders = +data_r?.total_takeaway_orders;
  const total_takeaway_order_amount = +data_r?.total_takeaway_order_amount;
  const total_dine_in_orders = +data_r?.total_dine_in_orders;
  const total_dine_in_order_amount = +data_r?.total_dine_in_order_amount;
  const total_delivery_orders = +data_r?.total_delivery_orders;
  const total_delivery_order_amount = +data_r?.total_delivery_order_amount;
  const total_orders = +data_r?.total_orders + +totals_party?.total_orders;

  const total_delivery_orders_all =
    total_delivery_orders + totals_party?.total_orders;
  const total_delivery_orders_amount =
    total_delivery_order_amount + totals_party?.net_total;

  const componentRef = useRef();
  const [exportData, setExportData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const delayPrint = debounce(handlePrint, 1000);
  const getExportData = () => {
    setExportLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/get/export/data?dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}`
    )
      .then((res) => {
        const data = res?.data;
        setExportData(data || null);
        delayPrint();
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setExportLoading(false);
      });
  };

  if (!data || data?.graphData?.length <= 0) {
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
      <BasicLineChart
        data={data?.graphData}
        categoryKey="order_date_d"
        seriesKey={["total_gross,Total Net"]}
        currencySymbol={merchant?.currency?.symbol || <>&euro;</>}
        isMultiMonth={isSpanningMoreThanOneMonth(dateRange)}
      />
      <div>
        <TableItem
          className={"pl-[5px]"}
          isFirstItem={true}
          isHeading={true}
          heading="Sales"
        />
        <TableItem
          className={"pl-[5px]"}
          isMainItem={true}
          heading="Gross Volume"
          content={contentwithSymbol(total_gross)}
        />
        {/* <TableItem
          className={"pl-[5px]"}
          heading="Item Sales"
          isIndent={true}
          content={contentwithSymbol(total_item_sales)}
        /> */}
        <TableItem
          className={"pl-[5px]"}
          heading="Delivery Charges"
          content={contentwithSymbol(total_delivery_charges)}
        />
        <TableItem
          className={"pl-[5px]"}
          heading="Service Charges"
          content={contentwithSymbol(total_service_charges)}
        />
        <TableItem
          className={"pl-[5px]"}
          heading="Discount"
          content={contentwithSymbol(total_discount)}
        />
        <TableItem
          className={"pl-[5px]"}
          isMainItem={true}
          heading="Net Volume"
          content={contentwithSymbol(total_net_amount)}
        />
        <TableItem
          className={"pl-[5px]"}
          heading="Taxes"
          content={contentwithSymbol(tax_amount)}
        />
        <TableItem
          className={"pl-[5px]"}
          isMainItem={true}
          heading="Total Sales"
          content={contentwithSymbol(total)}
        />
      </div>
      <div>
        <TableItem
          className={"pl-[5px]"}
          isFirstItem={true}
          isHeading={true}
          heading="FOC's & Sales Return"
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`F.O.C ${
            total_foc_orders > 0 ? `(${total_foc_orders})` : ""
          }`}
          isIndent={true}
          content={contentwithSymbol(total_foc_amount)}
          onClick={() => {
            router.push(
              `/sales/reports/data?filter=${ORDER_FILTERS_BY.order_paid_by}&filter_value=${paid_by.foc}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}&pageName=FOC`
            );
          }}
        />
        <TableItem
          className={"pl-[5px]"}
          heading="Sales Return"
          isIndent={true}
          content={contentwithSymbol(total_sales_return_amount)}
        />
      </div>

      {data?.partySales?.length > 0 ? (
        <>
          <div>
            <TableItem
              className={"pl-[5px]"}
              isFirstItem={true}
              isHeading={true}
              heading="Party Sales"
            />
            {data?.partySales?.map((item, index) => {
              return (
                <TableItem
                  key={index}
                  className={"pl-[5px]"}
                  heading={`${item?.name} ${
                    item?.total_orders > 0 ? `(${item?.total_orders})` : ""
                  }`}
                  isIndent={true}
                  content={contentwithSymbol(item?.net_total)}
                />
              );
            })}
            <TableItem
              className={"pl-[5px]"}
              heading="Total Party Sales"
              isLastItem={true}
              isMainItem={true}
              content={contentwithSymbol(totals_party?.net_total)}
            />
          </div>
        </>
      ) : null}

      <div>
        <TableItem
          className={"pl-[5px]"}
          isFirstItem={true}
          isHeading={true}
          heading="Payments"
        />
        <TableItem
          className={"pl-[5px]"}
          isMainItem={true}
          heading="Total Collected"
          content={contentwithSymbol(
            data?.orderData?.cash_total_amount +
              data?.orderData?.card_total_amount
          )}
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`Cash ${
            data_r?.total_cash_orders > 0
              ? `(${data_r?.total_cash_orders})`
              : ""
          }`}
          isIndent={true}
          content={contentwithSymbol(data?.orderData?.cash_total_amount)}
          onClick={() => {
            router.push(
              `/sales/reports/data?filter=${ORDER_FILTERS_BY.order_paid_by}&filter_value=${paid_by.cash}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}&pageName=Cash`
            );
          }}
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`Card ${
            data_r?.total_card_orders > 0
              ? `(${data_r?.total_card_orders})`
              : ""
          }`}
          isIndent={true}
          content={contentwithSymbol(data?.orderData?.card_total_amount)}
          onClick={() => {
            router.push(
              `/sales/reports/data?filter=${ORDER_FILTERS_BY.order_paid_by}&filter_value=${paid_by.card}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}&pageName=Card`
            );
          }}
        />
        {/* <TableItem
                      className={"pl-[5px]"}
                      heading={`Party Sales ${
                        totals_party?.total_orders > 0
                          ? `(${totals_party?.total_orders})`
                          : ""
                      }`}
                      isIndent={true}
                      content={contentwithSymbol(totals_party?.net_total)}
                      onClick={() => {}}
                    /> */}
        <TableItem
          className={"pl-[5px]"}
          heading="Net Total"
          isLastItem={true}
          isMainItem={true}
          content={contentwithSymbol(
            data?.orderData?.cash_total_amount +
              data?.orderData?.card_total_amount
          )}
        />
      </div>
      <div>
        <TableItem
          className={"pl-[5px]"}
          isFirstItem={true}
          isHeading={true}
          heading="Order Types"
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`Dine In ${
            total_dine_in_orders > 0 ? `(${total_dine_in_orders})` : ""
          }`}
          isIndent={true}
          content={contentwithSymbol(total_dine_in_order_amount)}
          onClick={() => {
            router.push(
              `/sales/reports/data?filter=${ORDER_FILTERS_BY.order_type}&filter_value=${order_type.dine_in}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}&pageName=DineIn`
            );
          }}
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`Takeaway ${
            total_takeaway_orders > 0 ? `(${total_takeaway_orders})` : ""
          }`}
          isIndent={true}
          content={contentwithSymbol(total_takeaway_order_amount)}
          onClick={() => {
            router.push(
              `/sales/reports/data?filter=${ORDER_FILTERS_BY.order_type}&filter_value=${order_type.takeaway}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}&pageName=Takeaway`
            );
          }}
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`Delivery ${
            total_delivery_orders_all > 0
              ? `(${total_delivery_orders_all})`
              : ""
          }`}
          isIndent={true}
          content={contentwithSymbol(total_delivery_orders_amount)}
          onClick={() => {
            router.push(
              `/sales/reports/data?filter=${ORDER_FILTERS_BY.order_type}&filter_value=${order_type.delivery}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}&pageName=Delivery`
            );
          }}
        />
        {/* <TableItem
          className={"pl-[5px]"}
          heading={`Party Delivery ${
            totals_party?.total_orders > 0
              ? `(${totals_party?.total_orders})`
              : ""
          }`}
          isIndent={true}
          moreIndent={true}
          content={contentwithSymbol(totals_party?.net_total)}
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`On-Call Delivery ${
            total_delivery_orders > 0 ? `(${total_delivery_orders})` : ""
          }`}
          isIndent={true}
          moreIndent={true}
          content={contentwithSymbol(total_delivery_order_amount)}
        /> */}
        <TableItem
          className={"pl-[5px]"}
          isMainItem={true}
          isLastItem={true}
          heading="Total Orders"
          content={total_orders || 0}
        />
      </div>
      <div>
        <TableItem
          className={"pl-[5px]"}
          isFirstItem={true}
          isHeading={true}
          heading="Order Sources"
        />
        {/* POS ORDERS START */}
        <TableItem
          className={"pl-[5px]"}
          heading={`POS ${
            order_sources?.pos?.total_orders > 0
              ? `(${order_sources?.pos?.total_orders})`
              : ""
          }`}
          isHeading={true}
          isIndent={true}
          content={contentwithSymbol(order_sources?.pos?.total_net_amount || 0)}
          onClick={() => {}}
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`Takeaway ${
            order_sources?.pos?.takeaway?.total_orders > 0
              ? `(${order_sources?.pos?.takeaway?.total_orders})`
              : ""
          }`}
          isIndent={true}
          moreIndent={true}
          content={contentwithSymbol(
            order_sources?.pos?.takeaway?.total_net_amount
          )}
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`Dine-In ${
            order_sources?.pos?.dine_in?.total_orders > 0
              ? `(${order_sources?.pos?.dine_in?.total_orders})`
              : ""
          }`}
          isIndent={true}
          moreIndent={true}
          content={contentwithSymbol(
            order_sources?.pos?.dine_in?.total_net_amount
          )}
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`On-Call Delivery ${
            order_sources?.pos?.on_call_delivery?.total_orders > 0
              ? `(${order_sources?.pos?.on_call_delivery?.total_orders})`
              : ""
          }`}
          isIndent={true}
          moreIndent={true}
          content={contentwithSymbol(
            order_sources?.pos?.on_call_delivery?.total_net_amount
          )}
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`Partner Delivery ${
            order_sources?.pos?.partner_delivery?.total_orders > 0
              ? `(${order_sources?.pos?.partner_delivery?.total_orders})`
              : ""
          }`}
          isIndent={true}
          moreIndent={true}
          content={contentwithSymbol(
            order_sources?.pos?.partner_delivery?.total_net_amount
          )}
        />
        {/* POS ORDERS END */}

        {/* SELF SERVICE ORDERS START */}
        <TableItem
          className={"pl-[5px]"}
          heading={`Self Service ${
            order_sources?.self_service?.total_orders > 0
              ? `(${order_sources?.self_service?.total_orders})`
              : "(0)"
          }`}
          isHeading={true}
          isIndent={true}
          content={contentwithSymbol(
            order_sources?.self_service?.total_net_amount
          )}
          onClick={() => {}}
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`Takeaway ${
            order_sources?.self_service?.takeaway?.total_orders > 0
              ? `(${order_sources?.self_service?.takeaway?.total_orders})`
              : "(0)"
          }`}
          isIndent={true}
          moreIndent={true}
          content={contentwithSymbol(
            order_sources?.self_service?.takeaway?.total_net_amount
          )}
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`Dine-In ${
            order_sources?.self_service?.dine_in?.total_orders > 0
              ? `(${order_sources?.self_service?.dine_in?.total_orders})`
              : "(0)"
          }`}
          isIndent={true}
          moreIndent={true}
          content={contentwithSymbol(
            order_sources?.self_service?.dine_in?.total_net_amount
          )}
        />
        {/* SELF SERVICE ORDERS END */}

        {/* ONLINE SITE START */}
        <TableItem
          className={"pl-[5px]"}
          heading={`Online Site ${
            order_sources?.online_site?.total_orders > 0
              ? `(${order_sources?.online_site?.total_orders})`
              : "(0)"
          }`}
          isHeading={true}
          isIndent={true}
          content={contentwithSymbol(
            order_sources?.online_site?.total_net_amount
          )}
          onClick={() => {}}
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`Collection ${
            order_sources?.online_site?.collection?.total_orders > 0
              ? `(${order_sources?.online_site?.collection?.total_orders})`
              : "(0)"
          }`}
          isIndent={true}
          moreIndent={true}
          content={contentwithSymbol(
            order_sources?.online_site?.collection?.total_net_amount
          )}
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`QR-Table ${
            order_sources?.online_site?.qr_table_order?.total_orders > 0
              ? `(${order_sources?.online_site?.qr_table_order?.total_orders})`
              : "(0)"
          }`}
          isIndent={true}
          moreIndent={true}
          content={contentwithSymbol(
            order_sources?.online_site?.qr_table_order?.total_net_amount
          )}
        />
        <TableItem
          className={"pl-[5px]"}
          heading={`Direct Delivery ${
            order_sources?.online_site?.direct_delivery?.total_orders > 0
              ? `(${order_sources?.online_site?.direct_delivery?.total_orders})`
              : "(0)"
          }`}
          isIndent={true}
          moreIndent={true}
          content={contentwithSymbol(
            order_sources?.online_site?.direct_delivery?.total_net_amount
          )}
        />
        {/* ONLINE SITE END */}
      </div>
    </>
  );
}
