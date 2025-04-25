import { useEffect, useState } from "react";
import NoData from "../reporting/no-data";
import moment from "moment";
import { REPORT_PAGES } from "@/utils/constants";
import BasicLineChart from "../reporting/basic-line-chart";
import { isSpanningMoreThanOneMonth } from "@/utils/helper";

export default function Dashboard({
  merchant,
  setCurrentReportPage,
  dateRange,
  data,
}) {
  const [perGraph, setPerGraph] = useState({
    card: 0,
    cash: 0,
    other: 0,
  });


  const [totalsParty, setTotalParty] = useState(null);
  const [itemSales, setItemSales] = useState(null);
  const [categorySales, setCategorySales] = useState(null);
  const [maxItemTotalSales, setMaxItemTotalSales] = useState(0);
  const [maxCategorySales, setMaxCategorySales] = useState(0);
  const [maxOrderTypeSales, setMaxOrderTypeSales] = useState(0);
  const [totalDeliveryOrders, setTotalDeliveryOrders] = useState(0);
  const [totalDeliveryOrderAmount, setDeliveryOrderAmount] = useState(0);

  useEffect(() => {
    if (data) {
      const totals_party = data?.partySales?.reduce(
        (acc, item) => {
          acc.total_orders += +item?.total_orders || 0;
          acc.gross_total += +item?.gross_total || 0;
          acc.total_discount += +item?.total_discount || 0;
          acc.net_total += +item?.net_total || 0;
          return acc;
        },
        {
          total_orders: 0,
          gross_total: 0,
          total_discount: 0,
          net_total: 0,
        }
      );
      setTotalParty(totals_party);

      setItemSales(
        data?.itemSales?.reduce(
          (acc, item) => {
            acc.total_sales += +item?.total_sales || 0;
            acc.total_item_sold += +item?.total_item_sold || 0;
            return acc;
          },
          {
            total_sales: 0,
            total_item_sold: 0,
          }
        )
      );
      setMaxItemTotalSales(
        data?.itemSales?.length > 0
          ? Math.max(
              ...data.itemSales.map((item) => parseFloat(item.total_sales))
            )
          : 0
      );

      setCategorySales(
        data?.categorySales?.reduce(
          (acc, item) => {
            acc.total_sales += +item?.total_sales || 0;
            acc.total_item_sold += +item?.total_item_sold || 0;
            return acc;
          },
          {
            total_sales: 0,
            total_item_sold: 0,
          }
        )
      );

      setMaxCategorySales(
        data?.categorySales?.length > 0
          ? Math.max(
              ...data.categorySales.map((item) => parseFloat(item.total_sales))
            )
          : 0
      );

      setPerGraph({
        cash: (
          (data?.orderData?.cash_total_amount /
            data?.orderData?.total_net_sales) *
          100
        ).toFixed(2),
        card: (
          (data?.orderData?.card_total_amount /
            data?.orderData?.total_net_sales) *
          100
        ).toFixed(2),
        other: (
          (totals_party?.net_total / data?.orderData?.total_net_sales) *
          100
        ).toFixed(2),
      });

      setTotalDeliveryOrders(
        data?.orderData?.total_delivery_orders + totalsParty?.total_orders
      );

      setDeliveryOrderAmount(
        +data?.orderData?.total_delivery_order_amount + totals_party?.net_total
      );

      setMaxOrderTypeSales(
        Math.max(
          +data?.orderData?.total_delivery_order_amount +
            totals_party?.net_total,
          +data?.orderData?.total_dine_in_order_amount,
          +data?.orderData?.total_takeaway_order_amount
        )
      );
    }
  }, [data]);


  const main_colors = ["bg-[#72D542]", "bg-[#44D35B]", "bg-[#348708]"];
  const BoxItem = ({ index = 0, height, cost, item }) => {
    return (
      <>
        <div
          style={{ height: `${height}px` }}
          className={`${main_colors[index]} border-[2px] rounded-[5px] hover:border-black w-full relative group`}
        >
          <div className="bg-[#232323] w-[100px] h-[50px] p-[10px] rounded-[6px] flex flex-col absolute top-[-60px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[13px]">
              {merchant?.currency?.symbol ?? <>&euro;</>} {cost || 0}
            </span>
            <span className="text-[8px] font-[300]"> {item || ""}</span>
          </div>
        </div>
      </>
    );
  };
  const ItemBoxItems = ({ index = 0, cost, item, total_sold_items }) => {
    const number = parseFloat(cost);
    const finalCost = number.toFixed(2);
    return (
      <div className="flex justify-between">
        <div className="flex gap-x-[10px] items-center">
          <div
            className={`w-[15px] h-[15px] rounded-[4px] ${main_colors[index]}`}
          ></div>
          <div className="text-[13px]">{item || ""}</div>
        </div>
        <div className="flex gap-x-[10px] items-center">
          <div className="text-[13px]">
            {merchant?.currency?.symbol || <>&euro;</>} {finalCost || 0}
          </div>
          <div className="text-[13px]">({total_sold_items})</div>
        </div>
      </div>
    );
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
      <div className="flex flex-col md:flex-row w-[100%]">
        <div className="w-[100%] md:w-[50%]">
          <p className="md:text-[20px] mt-12 px-4">Net Sale</p>
          <p className="text-[24px] md:text-[26px] font-bold text-[#868686] mt-2 px-4">
            {merchant?.currency?.symbol ?? <>&euro;</>}{" "}
            {data?.orderData?.total_net_sales || 0}
          </p>
          <div>
            {/* <img src="/images/chart.png" className="w-[100%]" /> */}
            {/* chart is here */}
            {/* {series.length > 0 ? (
                  <Line_Chart data={series} categories={categories} />
                ) : (
                  <></>
                )} */}
            <BasicLineChart
              data={data?.graphData}
              categoryKey="order_date_d"
              seriesKey={["total_gross,Total Net"]}
              currencySymbol={merchant?.currency?.symbol || <>&euro;</>}
              isMultiMonth={isSpanningMoreThanOneMonth(dateRange)}
            />
          </div>
        </div>

        <div className="w-[2px] h-[400px] hidden md:flex bg-gray-300 mt-4"></div>

        <div className="w-[100%] md:w-[50%] px-4">
          <p className="text-[18px] md:text-[24px] mt-12">Payment type</p>
          {/* <select
                id="sort-by"
                name="sort-by"
                className="px-3 mt-3 bg-gray-50 py-5  border outline-none rounded-lg"
              >
                <option value="relevance">This week</option>
                <option value="popularity">The month</option>
                <option value="date">cloud9</option>
                <option value="price">Price</option>
              </select> */}

          <div className="flex gap-3 mt-8">
            <div
              style={{
                width: perGraph?.cash == 0 ? 25 : perGraph?.cash + "%",
              }}
            >
              <div
                style={{ width: perGraph?.cash == 0 ? 0 : "100%" }}
                className={`h-[20px] rounded-[3px] bg-[#72D542]`}
              ></div>
              <div className="text-center text-[12px] mt-[5px]">
                {perGraph?.cash + "%"}
              </div>
            </div>
            <div
              style={{
                width: perGraph?.card == 0 ? 25 : perGraph?.card + "%",
              }}
            >
              <div
                style={{ width: perGraph?.card == 0 ? 0 : "100%" }}
                className={`h-[20px] rounded-[3px] bg-[#44D35B]`}
              ></div>
              <div className="text-center text-[12px] mt-[5px]">
                {perGraph?.card + "%"}
              </div>
            </div>
            <div
              style={{
                width: perGraph?.other == 0 ? 25 : perGraph?.other + "%",
              }}
            >
              <div
                style={{ width: perGraph?.other == 0 ? 0 : "100%" }}
                className={`h-[20px] rounded-[3px] bg-[#348708]`}
              ></div>
              <div className="text-center text-[12px] mt-[5px]">
                {perGraph?.other + "%"}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <div className="flex gap-3 md:gap-5 items-center">
              <div className="rounded-full w-[10px] md:w-[13px] h-[10px] md:h-[13px] bg-[#72D542]"></div>
              <p className=" md:text-[20px]">Cash</p>
            </div>
            <div>
              <p className="text-[#868686]  md:text-[20px] font-bold">
                {merchant?.currency?.symbol ?? <>&euro;</>}{" "}
                {data?.orderData?.cash_total_amount?.toFixed(2) || 0}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-8">
            <div className="flex gap-3 md:gap-5 items-center">
              <div className="rounded-full w-[10px] md:w-[13px] h-[10px] md:h-[13px] bg-[#44D35B]"></div>
              <p className=" md:text-[20px]">Card</p>
            </div>
            <div>
              <p className="text-[#868686]  md:text-[20px] font-bold">
                {merchant?.currency?.symbol ?? <>&euro;</>}{" "}
                {data?.orderData?.card_total_amount?.toFixed(2) || 0}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-8">
            <div className="flex gap-3 md:gap-5 items-center">
              <div className="rounded-full w-[10px] md:w-[13px] h-[10px] md:h-[13px] bg-[#348708]"></div>
              <p className=" md:text-[20px]">Other</p>
            </div>
            <div>
              <p className="text-[#868686]  md:text-[20px] font-bold">
                {merchant?.currency?.symbol ?? <>&euro;</>}{" "}
                {totalsParty?.net_total?.toFixed(2) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr className="mt-2" />
      <div className="flex flex-col md:flex-row w-[100%]">
        <div className="w-[100%] md:w-[50%]">
          <div className="px-4">
            <div>
              <p className="text-[18px] md:text-[24px] mt-4">Customers</p>
            </div>
            <div className="w-full flex flex-col gap-y-[30px] mt-[70px]">
              <div className="flex justify-between">
                <h6>Total customers</h6>
                <p>{data?.customers?.totalCustomers || 0}</p>
              </div>
              <div className="flex justify-between">
                <h6>Returning customers</h6>
                <p>{data?.customers?.returnungCustomer || 0}</p>
              </div>
              <div className="flex justify-between">
                <h6>Avg. visits per customer</h6>
                <p>{(data?.customers?.avgVisitsPerCustomer || 0).toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <h6>Avg. spent per customer</h6>
                <p>{(data?.customers?.avgSpentPerCustomer || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[2px] h-[350px] hidden md:flex bg-gray-300 mt-4"></div>
        <div className="w-[100%] md:w-[50%]">
          <div className="px-4">
            <div>
              <p className="text-[18px] md:text-[24px] mt-4">Items</p>
              <p className="font-[300]">by Gross sales</p>
            </div>
            <div>
              <div className="flex justify-end my-[10px] text-[13px]">
                <span>
                  {merchant?.currency?.symbol ?? <>&euro;</>}{" "}
                  {itemSales?.total_sales || 0}
                </span>
              </div>
              <div className="flex items-end gap-x-[10px] relative">
                {data?.itemSales?.length > 0 ? (
                  <>
                    {data?.itemSales
                      ?.slice() // Create a shallow copy to avoid mutating the original array
                      .reverse() // Reverse the copied array
                      .map((item, index) => (
                        <BoxItem
                          key={index}
                          cost={item?.total_sales}
                          height={(
                            (parseFloat(item?.total_sales) /
                              maxItemTotalSales) *
                            100
                          ).toFixed(0)}
                          item={item?.menu_item_name}
                          index={index}
                        />
                      ))}
                  </>
                ) : (
                  <>
                    <NoData>
                      <h2 className="font-[500] text-[16px]">
                        No Record Found
                      </h2>
                    </NoData>
                  </>
                )}
              </div>
              <div className="flex justify-between text-[13px] mt-[10px] gap-x-[10px] relative w-full">
                <span>Lowest</span>
                <span></span>
                <span>Highest</span>
              </div>
              <div className="flex flex-col gap-y-[10px] mt-[30px]">
                {data?.itemSales?.length > 0 ? (
                  <>
                    {data?.itemSales
                      ?.slice() // Create a shallow copy to avoid mutating the original array
                      .reverse() // Reverse the copied array
                      .map((item, index) => (
                        <div key={index}>
                          <ItemBoxItems
                            key={index}
                            cost={item?.total_sales}
                            item={item?.menu_item_name}
                            total_sold_items={item?.total_item_sold}
                            index={index}
                          />
                        </div>
                      ))}
                  </>
                ) : (
                  <></>
                )}
              </div>
              <div className="flex justify-between mt-[20px]">
                <button
                  onClick={() => {
                    setCurrentReportPage(REPORT_PAGES.item_sales);
                  }}
                  className="text-[13px] underline"
                >
                  View More
                </button>
                <div>
                  <h2 className="text-[13px]">
                    {moment(dateRange[0]).format("MMM D, YYYY") +
                      " - " +
                      moment(dateRange[1]).format("MMM D, YYYY")}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="mt-2" />
      <div className="flex flex-col md:flex-row w-[100%]">
        <div className="w-[100%] md:w-[50%]">
          <div className="px-4">
            <div>
              <p className="text-[18px] md:text-[24px] mt-4">Categories</p>
              <p className="font-[300]">by Gross sales</p>
            </div>
            <div>
              <div className="flex justify-end my-[10px] text-[13px]">
                <span>
                  {merchant?.currency?.symbol ?? <>&euro;</>}{" "}
                  {categorySales?.total_sales || 0}
                </span>
              </div>
              <div className="flex items-end gap-x-[10px] relative">
                {data?.categorySales?.length > 0 ? (
                  <>
                    {data?.categorySales
                      ?.slice() // Create a shallow copy to avoid mutating the original array
                      .reverse() // Reverse the copied array
                      .map((item, index) => (
                        <BoxItem
                          key={index}
                          cost={item?.total_sales}
                          height={(
                            (parseFloat(item?.total_sales) / maxCategorySales) *
                            100
                          ).toFixed(0)}
                          item={item?.menu_category_name}
                          index={index}
                        />
                      ))}
                  </>
                ) : (
                  <>
                    <NoData>
                      <h2 className="font-[500] text-[16px]">
                        No Record Found
                      </h2>
                    </NoData>
                  </>
                )}
              </div>
              <div className="flex justify-between text-[13px] mt-[10px] gap-x-[10px] relative w-full">
                <span>Lowest</span>
                <span></span>
                <span>Highest</span>
              </div>
              <div className="flex flex-col gap-y-[10px] mt-[30px]">
                {data?.categorySales?.length > 0 ? (
                  <>
                    {data?.categorySales
                      ?.slice() // Create a shallow copy to avoid mutating the original array
                      .reverse() // Reverse the copied array
                      .map((item, index) => (
                        <ItemBoxItems
                          key={index}
                          cost={item?.total_sales}
                          item={item?.menu_category_name}
                          total_sold_items={item?.total_item_sold}
                          index={index}
                        />
                      ))}
                  </>
                ) : (
                  <></>
                )}
              </div>
              <div className="flex justify-between mt-[20px]">
                <button
                  onClick={() => {
                    setCurrentReportPage(REPORT_PAGES.category_sales);
                  }}
                  className="text-[13px] underline"
                >
                  View More
                </button>
                <div>
                  <h2 className="text-[13px]">
                    {moment(dateRange[0]).format("MMM D, YYYY") +
                      " - " +
                      moment(dateRange[1]).format("MMM D, YYYY")}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[2px] h-[350px] hidden md:flex bg-gray-300 mt-4"></div>
        <div className="w-[100%] md:w-[50%]">
          <div className="px-4">
            <div>
              <p className="text-[18px] md:text-[24px] mt-4">Order Type</p>
              <p className="font-[300]">summary</p>
            </div>
            <div>
              <div className="flex justify-end my-[10px] text-[13px]">
                <span>
                  {merchant?.currency?.symbol ?? <>&euro;</>}{" "}
                  {+data?.orderData?.total_net_sales || 0}
                </span>
              </div>
              <div className="flex items-end gap-x-[10px] relative">
                <BoxItem
                  cost={+data?.orderData?.total_dine_in_order_amount}
                  height={(
                    (parseFloat(data?.orderData?.total_dine_in_order_amount) /
                      maxOrderTypeSales) *
                    100
                  ).toFixed(0)}
                  item={"Dine In"}
                  index={0}
                />
                <BoxItem
                  cost={+data?.orderData?.total_takeaway_order_amount}
                  height={(
                    (parseFloat(+data?.orderData?.total_takeaway_order_amount) /
                      maxOrderTypeSales) *
                    100
                  ).toFixed(0)}
                  item={"Takeaway"}
                  index={1}
                />
                <BoxItem
                  cost={totalDeliveryOrderAmount}
                  height={(
                    (parseFloat(totalDeliveryOrderAmount) / maxOrderTypeSales) *
                    100
                  ).toFixed(0)}
                  item={"Delivery"}
                  index={2}
                />
              </div>
              <div className="flex flex-col gap-y-[10px] mt-[30px]">
                <ItemBoxItems
                  cost={+data?.orderData?.total_dine_in_order_amount}
                  item={"Dine In"}
                  total_sold_items={+data?.orderData?.total_dine_in_orders}
                  index={0}
                />
                <ItemBoxItems
                  cost={+data?.orderData?.total_takeaway_order_amount}
                  item={"Takeaway"}
                  total_sold_items={+data?.orderData?.total_takeaway_orders}
                  index={1}
                />
                <ItemBoxItems
                  cost={+data?.orderData?.total_delivery_order_amount}
                  item={"Delivery"}
                  total_sold_items={+data?.orderData?.total_delivery_orders}
                  index={2}
                />
              </div>
              {/* <div className="flex justify-between mt-[20px]">
                <button onClick={()=>{
                    
                }} href={"#"} className="text-[13px] underline">
                  View More
                </button>
                <div>
                  <h2 className="text-[13px]">
                    {moment(dateRange[0]).format("MMM D, YYYY") +
                      " - " +
                      moment(dateRange[1]).format("MMM D, YYYY")}
                  </h2>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
