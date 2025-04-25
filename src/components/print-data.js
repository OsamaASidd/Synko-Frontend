"use client";
import moment from "moment";
import { forwardRef, useContext } from "react";
import { Table, Button } from "rsuite";
import "rsuite/Table/styles/index.css";
const { Column, HeaderCell, Cell } = Table;
const PrintData = forwardRef((props, ref) => {
  const { data, merchant, dateRange } = props;

  if (!data) return null;

  const HeadingItem = ({ valueOne, valueTwo }) => {
    return (
      <div className="flex items-center w-full">
        <div className="w-[150px] px-[10px] py-[2px] font-[600] bg-[#f5deb3]">
          {valueOne}
        </div>
        <div className="px-[10px] py-[2px] bg-[#fdf5e6] w-full">{valueTwo}</div>
      </div>
    );
  };

  const contentwithSymbol = (content) => {
    const number = parseFloat(content || 0);
    return `${merchant?.currency?.symbol || <>&euro;</>}${number.toFixed(2)}`;
  };
  const CurrencyCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
      {rowData[dataKey]
        ? `${contentwithSymbol(rowData[dataKey])}`
        : rowData[dataKey]}
    </Cell>
  );

  // Calculate totals
  const totals = data?.categorySales?.reduce(
    (acc, item) => {
      acc.total_item_sold += +item.total_item_sold;
      acc.total_sales += +item.total_sales;
      acc.total_discount += +item.total_discount;
      acc.net_sales += +item.net_sales;
      return acc;
    },
    { total_item_sold: 0, total_sales: 0, total_discount: 0, net_sales: 0 }
  );

  const totals_employee = data?.employeeSales?.reduce(
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

  const TableData = ({
    isHeading = false,
    isLastRow = false,
    numberOfColumns = 1,
    children,
    className,
  }) => {
    return (
      <div
        className={`${
          isHeading == true
            ? "border-y-[2px] border-[#d4b58c] bg-[#f5deb3] font-[600]"
            : "bg-[#fdf5e6]"
        } text-[16px] grid ${
          numberOfColumns == 3
            ? "grid-cols-3"
            : numberOfColumns == 5
            ? "grid-cols-5"
            : "grid-cols-1 text-center"
        } ${
          isLastRow == true ? "border-y-[2px] border-[#d4b58c] font-[500]" : ""
        } gap-4 py-[5px] px-[10px] w-full items-center ${className || ""}`}
      >
        {children}
      </div>
    );
  };

  console.log("DATA DATA");
  console.log(data);
  return (
    <>
      <div ref={ref} className="w-[980px] text-black p-4 bg-white">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-[10px] mt-[40px] text-center w-full text-[20px] font-[500]">
            <h3>{merchant?.name}</h3>
            <h3 className="text-[18px]">Daily Totals</h3>
          </div>
          <div className="mb-[10px] border w-full border-[#d4b58c] rounded-[3px]">
            <HeadingItem
              valueOne={"Report Date:"}
              valueTwo={"2024-06-20 5:14:36 PM"}
            />
            <HeadingItem
              valueOne={"From Date:"}
              valueTwo={moment(dateRange[0]).format("MMM D, YYYY")}
            />
            <HeadingItem
              valueOne={"To Date:"}
              valueTwo={moment(dateRange[1]).format("MMM D, YYYY")}
            />

            <HeadingItem />

            <HeadingItem valueOne={"Devices:"} valueTwo={"All Devices"} />
            <HeadingItem valueOne={"Shift:"} valueTwo={"All Shifts"} />

            <HeadingItem />

            <HeadingItem valueOne={"Store:"} valueTwo={merchant?.name} />
          </div>

          <div className="mb-[10px] w-full">
            <TableData isHeading={true} numberOfColumns={5}>
              <div>Sales</div>
              <div>Qnty</div>
              <div>Gross Amount</div>
              <div>Discounts</div>
              <div>Amount</div>
            </TableData>
            {data?.categorySales?.length > 0 ? (
              <>
                {data?.categorySales?.map((item, index) => {
                  return (
                    <TableData key={index} numberOfColumns={5}>
                      <div>{item?.menu_category_name}</div>
                      <div>{item?.total_item_sold}</div>
                      <div>{contentwithSymbol(item?.total_sales)}</div>
                      <div>{contentwithSymbol(item?.total_discount)}</div>
                      <div>{contentwithSymbol(item?.net_sales)}</div>
                    </TableData>
                  );
                })}
                <TableData isLastRow={true} numberOfColumns={5}>
                  <div>Totals</div>
                  <div>{totals?.total_item_sold}</div>
                  <div>{contentwithSymbol(totals?.total_sales)}</div>
                  <div>{contentwithSymbol(totals?.total_discount)}</div>
                  <div>{contentwithSymbol(totals?.net_sales)}</div>
                </TableData>
              </>
            ) : (
              <>
                <TableData>
                  <div>No Record</div>
                </TableData>
              </>
            )}
          </div>

          <div className="mb-[10px] w-full">
            <TableData isHeading={true} numberOfColumns={5}>
              <div>Taxes</div>
              <div>Order Qnty</div>
              <div></div>
              <div></div>
              <div>Amount</div>
            </TableData>
            <TableData numberOfColumns={5}>
              <div>{`Tax ${
                merchant?.tax?.tax ? `${merchant?.tax?.tax}%` : ""
              }`}</div>
              <div>
                {data?.salesSummary?.total_cash_orders +
                  data?.salesSummary?.total_card_orders +
                  data?.salesSummary?.total_foc_orders}
              </div>
              <div></div>
              <div></div>
              <div>
                {contentwithSymbol(data?.salesSummary?.total_tax_amount)}
              </div>
            </TableData>
            <TableData isLastRow={true} numberOfColumns={5}>
              <div>Totals</div>
              <div>
                {data?.salesSummary?.total_cash_orders +
                  data?.salesSummary?.total_card_orders +
                  data?.salesSummary?.total_foc_orders}
              </div>
              <div></div>
              <div></div>
              <div>
                {contentwithSymbol(
                  totals?.net_sales + data?.salesSummary?.total_tax_amount
                )}
              </div>
            </TableData>
          </div>

          <div className="mb-[10px] w-full">
            <TableData isHeading={true} numberOfColumns={5}>
              <div>Payments</div>
              <div>Qnty</div>
              <div></div>
              <div></div>
              <div>Amount</div>
            </TableData>
            {[
              {
                payment_name: "Cash",
                total_item_sold: data?.salesSummary?.total_cash_orders || 0,
                total_amount: data?.salesSummary?.cash_total_amount || 0,
              },
              {
                payment_name: "Card",
                total_item_sold: data?.salesSummary?.total_card_orders || 0,
                total_amount: data?.salesSummary?.card_total_amount || 0,
              },
              {
                payment_name: "F.O.C",
                total_item_sold: data?.salesSummary?.total_foc_orders || 0,
                total_amount: data?.salesSummary?.total_foc_amount || 0,
              },
            ].map((item, index) => {
              return (
                <TableData key={index} numberOfColumns={5}>
                  <div>{item?.payment_name}</div>
                  <div>{item?.total_item_sold}</div>
                  <div></div>
                  <div></div>
                  <div>{contentwithSymbol(item?.total_amount)}</div>
                </TableData>
              );
            })}
            <TableData isLastRow={true} numberOfColumns={5}>
              <div>Totals</div>
              <div>
                {data?.salesSummary?.total_cash_orders +
                  data?.salesSummary?.total_card_orders +
                  data?.salesSummary?.total_foc_orders}
              </div>
              <div></div>
              <div></div>
              <div>
                {contentwithSymbol(
                  totals?.net_sales + data?.salesSummary?.total_tax_amount
                )}
              </div>
            </TableData>
          </div>
          <div className="mb-[10px] w-full">
            <TableData isHeading={true} numberOfColumns={5}>
              <div>Delivery</div>
              <div>Qnty</div>
              <div></div>
              <div></div>
              <div>Amount</div>
            </TableData>
            <TableData numberOfColumns={5}>
              <div>Delivery</div>
              <div>{data?.salesSummary?.total_delivery_orders}</div>
              <div></div>
              <div></div>
              <div>
                {contentwithSymbol(
                  data?.salesSummary?.total_delivery_order_amount
                )}
              </div>
            </TableData>
          </div>
          <div className="mb-[10px] w-full">
            <TableData isHeading={true} numberOfColumns={5}>
              <div>Party Sales</div>
              <div>Qnty</div>
              <div>Gross Amount</div>
              <div>Discounts</div>
              <div>Amount</div>
            </TableData>
            {data?.partySales?.length > 0 ? (
              <>
                {data?.partySales?.map((item, index) => {
                  return (
                    <TableData key={index} numberOfColumns={5}>
                      <div>{item?.name}</div>
                      <div>{item?.total_orders}</div>
                      <div>{contentwithSymbol(item?.gross_total)}</div>
                      <div>{contentwithSymbol(item?.total_discount)}</div>
                      <div>{contentwithSymbol(item?.net_total)}</div>
                    </TableData>
                  );
                })}
                <TableData isLastRow={true} numberOfColumns={5}>
                  <div>Totals</div>
                  <div>{totals_party?.total_orders}</div>
                  <div>{contentwithSymbol(totals_party?.gross_total)}</div>
                  <div>{contentwithSymbol(totals_party?.total_discount)}</div>
                  <div>{contentwithSymbol(totals_party?.net_total)}</div>
                </TableData>
              </>
            ) : (
              <>
                <TableData>
                  <div>No Record</div>
                </TableData>
              </>
            )}
          </div>

          <div className="mb-[10px] w-full">
            <TableData isHeading={true} numberOfColumns={5}>
              <div>Employee Sales Summary</div>
              <div>Qnty</div>
              <div>Gross Amount</div>
              <div>Discounts</div>
              <div>Amount</div>
            </TableData>
            {data?.employeeSales?.length > 0 ? (
              <>
                {data?.employeeSales?.map((item, index) => {
                  return (
                    <TableData key={index} numberOfColumns={5}>
                      <div>{item?.name}</div>
                      <div>{item?.total_orders}</div>
                      <div>{contentwithSymbol(item?.gross_total)}</div>
                      <div>{contentwithSymbol(item?.total_discount)}</div>
                      <div>{contentwithSymbol(item?.net_total)}</div>
                    </TableData>
                  );
                })}
                <TableData isLastRow={true} numberOfColumns={5}>
                  <div>Totals</div>
                  <div>{totals_employee?.total_orders}</div>
                  <div>{contentwithSymbol(totals_employee?.gross_total)}</div>
                  <div>
                    {contentwithSymbol(totals_employee?.total_discount)}
                  </div>
                  <div>{contentwithSymbol(totals_employee?.net_total)}</div>
                </TableData>
              </>
            ) : (
              <>
                <TableData>
                  <div>No Record</div>
                </TableData>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
});
PrintData.displayName = "PrintData";
export default PrintData;
