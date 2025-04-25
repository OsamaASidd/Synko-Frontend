"use client";

import CSpinner from "@/components/common/CSpinner";
import SideMenu from "@/components/menus/SideMenu";
import BasicLineChart from "@/components/reporting/basic-line-chart";
import NoData from "@/components/reporting/no-data";
import TableItem from "@/components/reporting/table-item";
import CustomDateRangePicker from "@/components/ui/custom-date-range-picker";
import { GlobalContext } from "@/context";
import { getRequest } from "@/utils/apiFunctions";
import {
  FILTERS,
  formatToMySQLDate,
  getErrorMessageFromResponse,
  isSpanningMoreThanOneMonth,
} from "@/utils/helper";
import moment from "moment";
import { useContext, useEffect, useState } from "react";

function SalesSummary() {
  const { merchant } = useContext(GlobalContext);
  const [dateRange, setDateRange] = useState([
    formatToMySQLDate(new Date()),
    formatToMySQLDate(new Date()),
  ]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleDateRangeChange = (range) => {
    if (range && range.length > 0) {
      const fromDate = new Date(range[0]);
      const toDate = new Date(range[1]);

      const formattedFromDate = formatToMySQLDate(fromDate);
      const formattedToDate = formatToMySQLDate(toDate);

      setDateRange([formattedFromDate, formattedToDate]);
    }
  };

  const getData = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/get/sales-summary?filter=${FILTERS.cash_drawer}dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}`
    )
      .then((res) => {
        const data = res?.data;
        setData(data || null);
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    if (merchant?.id !== undefined && dateRange) {
      getData();
    }
  }, [dateRange, merchant]);

  const contentwithSymbol = (content) => {
    const number = parseFloat(content || 0);
    return `${merchant?.currency?.symbol ?? <>&euro;</>}${number.toFixed(2)}`;
  };

  const data_r = data?.orderData;
  const total_gross = +data_r?.total_gross;
  const tax_amount = +data_r?.total_tax_amount;
  const total = tax_amount <= 0 ? total_gross : tax_amount + total_gross;
  const total_discount = +data_r?.total_discount;
  const total_net_amount = total - total_discount;

  const total_foc_orders = +data_r?.total_foc_orders;
  const total_foc_amount = +data_r?.total_foc_amount;
  const total_sales_return_amount = +data_r?.total_sales_return_amount;

  return (
    <>
      <div className="min-h-screen flex bg-[#171821] relative">
        <SideMenu />
        <div className=" w-[100%] xl:pl-0 xl:w-[80%] overflow-y-auto px-5 xl:px-0 xl:pr-5 py-6 h-screen text-black bg-[#171821]">
          <div className="px-4 md:px-10 rounded-lg py-12 bg-gray-50 h-[calc(100vh-48px)] overflow-y-auto w-[100%]">
            <div className="flex">
              <p className="text-[28px] md:text-[33px]">Sales Summary</p>
            </div>
            <div className="mt-[20px]">
              <CustomDateRangePicker onChange={handleDateRangeChange} />
            </div>
            <div className="mt-[30px]">
              {loading == true ? (
                <div className="min-h-[200px] w-full justify-center items-center flex">
                  <CSpinner color="text-black !w-[50px] !h-[50px]" />
                </div>
              ) : data ? (
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
                      heading="Gross Sales"
                      content={contentwithSymbol(total)}
                    />
                    <TableItem
                      className={"pl-[5px]"}
                      heading="Item"
                      isIndent={true}
                      content={contentwithSymbol(total_gross)}
                    />
                    <TableItem
                      className={"pl-[5px]"}
                      heading="Tax"
                      isIndent={true}
                      content={contentwithSymbol(tax_amount)}
                    />
                    <TableItem
                      className={"pl-[5px]"}
                      heading="Discount"
                      isIndent={true}
                      content={contentwithSymbol(total_discount)}
                    />
                    <TableItem
                      className={"pl-[5px]"}
                      isMainItem={true}
                      isLastItem={true}
                      heading="Net Sales"
                      content={contentwithSymbol(total_net_amount)}
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
                    />
                    <TableItem
                      className={"pl-[5px]"}
                      heading="Sales Return"
                      isIndent={true}
                      content={contentwithSymbol(total_sales_return_amount)}
                    />
                  </div>
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
                      content={contentwithSymbol(total_net_amount)}
                    />
                    <TableItem
                      className={"pl-[5px]"}
                      heading="Cash"
                      isIndent={true}
                      content={contentwithSymbol(
                        data?.orderData?.cash_total_amount
                      )}
                    />
                    <TableItem
                      className={"pl-[5px]"}
                      heading="Card"
                      isIndent={true}
                      content={contentwithSymbol(
                        data?.orderData?.card_total_amount
                      )}
                    />
                    <TableItem
                      className={"pl-[5px]"}
                      heading="Net Total"
                      isLastItem={true}
                      isMainItem={true}
                      content={contentwithSymbol(total_net_amount)}
                    />
                  </div>
                </>
              ) : (
                <NoData>
                  <h2 className="font-[500] text-[16px]">
                    No Transactions in This Time Frame
                  </h2>
                  <p className="text-[12px]">
                    No transactions took place during the time frame you
                    selected.
                  </p>
                </NoData>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SalesSummary;
