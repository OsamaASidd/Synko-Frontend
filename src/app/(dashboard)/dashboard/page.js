"use client";
import { TfiBell } from "react-icons/tfi";
import { BsTag } from "react-icons/bs";
import { GiKnifeFork } from "react-icons/gi";
import SideMenu from "@/components/menus/SideMenu";
import Link from "next/link";
import { GlobalContext } from "@/context";
import { useContext, useEffect, useState } from "react";
import { getRequest } from "@/utils/apiFunctions";
import Line_Chart from "@/components/Charts/line_chart";
import Badge from "@mui/material/Badge";
import Stack from "@mui/material/Stack";
import {
  FILTERS,
  formatToMySQLDate,
  getErrorMessageFromResponse,
  isSpanningMoreThanOneMonth,
} from "@/utils/helper";
import CustomDateRangePicker from "@/components/ui/custom-date-range-picker";
import BasicLineChart from "@/components/reporting/basic-line-chart";
import CSpinner from "@/components/common/CSpinner";
import NoData from "@/components/reporting/no-data";
import moment from "moment";
import { REPORT_PAGES } from "@/utils/constants";
import UserSubscription from "@/components/user-subscription";

export default function Dashboard() {
  const { merchant, user, setMerchant, setUserRole } =
    useContext(GlobalContext);

  const [dateRange, setDateRange] = useState([
    formatToMySQLDate(new Date()),
    formatToMySQLDate(new Date()),
  ]);
  const handleDateRangeChange = (range) => {
    if (range && range.length > 0) {
      const fromDate = new Date(range[0]);
      const toDate = new Date(range[1]);

      const formattedFromDate = formatToMySQLDate(fromDate);
      const formattedToDate = formatToMySQLDate(toDate);

      setDateRange([formattedFromDate, formattedToDate]);
    }
  };

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [notificationNum, setNotificationNum] = useState(0);

  const [query, setQeury] = useState("this-month");
  const [perGraph, setPerGraph] = useState({
    card: 0,
    cash: 0,
    other: 0,
  });

  const [merchants, setMerchants] = useState([]);
  const [series, setseries] = useState([]);
  const [categories, setcategories] = useState([]);

  const getMerchantData = () => {
    setLoading(true);
    getRequest(`/my-merchants`)
      .then((res) => {
        setMerchants(res?.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // get notificatins
  const get_inventory_notifications = () => {
    getRequest(`/merchant/${merchant?.id}/notifications`)
      .then((res) => {
        setNotificationNum(res?.data?.unChacked);
      })
      .finally(() => {});
  };

  const getData = () => {
    setLoading(true);
    setData(null);
    getRequest(
      `/merchant/${merchant?.id}/get_dashboard_sales?query=${query}&filter=${FILTERS.sales_report}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}`
    )
      .then((res) => {
        const data = res?.data;
        setData(data || null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const [totalsParty, setTotalParty] = useState(null);
  const [itemSales, setItemSales] = useState(null);
  const [categorySales, setCategorySales] = useState(null);
  const [maxItemTotalSales, setMaxItemTotalSales] = useState(0);
  const [maxCategorySales, setMaxCategorySales] = useState(0);
  const [maxOrderTypeSales, setMaxOrderTypeSales] = useState(0);
  const [totalDeliveryOrders, setTotalDeliveryOrders] = useState(0);
  const [totalDeliveryOrderAmount, setDeliveryOrderAmount] = useState(0);
  // const [] = useState();

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

  // console.log("DATA FOR BOTH DASHBOARD");
  // console.log(data);
  // console.log(totalsParty);

  useEffect(() => {
    // Check if merchant?.id is not undefined and user is truthy
    if (merchant?.id !== undefined && user) {
      getMerchantData();
      getData();
      get_inventory_notifications();
    }
  }, [user, merchant, query, dateRange]);

  const handleChangeMerchant = (event) => {
    const merchant_id = event.target.value;
    getRequest(`/merchant/${merchant_id}`)
      .then((res) => {
        localStorage.removeItem("merchant");
        localStorage.setItem("merchant", JSON.stringify(res?.data));
        setMerchant(res?.data);
        const getCurrentRole = merchants.find(
          (obj) => obj.merchant_id == merchant_id
        );
        setUserRole(getCurrentRole);
      })
      .catch((error) => {
        console.error("Error fetching merchant data:", error);
        getErrorMessageFromResponse(error);
        // Handle the error (e.g., show a notification or error message)
      })
      .finally(() => {
        setLoading(false); // Ensure loading is set to false both after success and failure
      });
  };

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
            {merchant?.currency?.symbol || <>&euro;</>} {cost || 0}
          </div>
          <div className="text-[13px]">{total_sold_items || ""}</div>
        </div>
      </div>
    );
  };

  return (
    <UserSubscription>
      <div className="min-h-screen h-screen overflow-hidden flex relative">
        <SideMenu />

        {/* {loading == true && (
        <>
          <div className="w-[100%] h-[100%] absolute bg-black">
            <div className="flex justify-center items-center w-[100%]">
              <PulseLoader
                color={"white"}
                loading={loading}
                size={30}
                data-testid="loader"
                className="bg-slate-600"
              />
            </div>
          </div>
        </>
      )} */}

        <div className="w-[100%] px-5 xl:px-0 xl:pr-5 xl:w-[80%] overflow-y-auto py-6 h-screen text-black bg-[#171821]">
          <div className=" px-3  md:px-4 rounded-lg py-6 bg-gray-50 h-[calc(100vh-48px)] overflow-y-auto w-[100%]">
            {" "}
            {/*min-h-screen*/}
            <div className="sm:flex justify-between gap-2 items-center ">
              <div className="flex">
                <p className="text-[20px] whitespace-nowrap mt-4 sm:mt-0 sm:text-[28px]">
                  Welcome Back!
                </p>
              </div>
              <div className="flex sm:justify-end justify-center gap-2 md:gap-4 items-center w-full">
                <div className="relative border-2 px-2 py-1.5 rounded-xl border-[#EAEAEA]">
                  <Link href="/notifications">
                    {/* <BiBell className="text-gray-600" size="30" />
                  <div className="w-[20px] h-[20px] bg-red-600 absolute bottom-5 right-1 rounded-full">
                    12
                  </div> */}
                    <Stack spacing={2} direction="row">
                      <Badge badgeContent={notificationNum} color="error">
                        <TfiBell className="text-[#313131] text-[28px]" />
                      </Badge>
                    </Stack>
                  </Link>
                </div>

                <select
                  id="sort-by"
                  name="sort-by"
                  className="px-2 sm:px-4 py-3 w-full sm:w-fit border outline-none rounded-lg bg-white"
                  onChange={handleChangeMerchant}
                  value={merchant?.id}
                >
                  {merchants?.length > 0 ? (
                    <>
                      {merchants.map((item, index) => (
                        <option key={index} value={item?.merchant_id}>
                          {item?.merchant?.name ?? ""}
                        </option>
                      ))}
                    </>
                  ) : (
                    <></>
                  )}
                </select>
              </div>
            </div>
            <Link href="/reports/analytics" className="py-3 block">
              <div className="w-[100%] py-1 space-x-4 bg-[#E2F6D9] rounded-lg flex items-center justify-between px-6">
                <div className="sm:w-[85%] w-[70%] text-[#3E3E3E] sm:text-[16px] text-[12px]">
                  <span className="font-bold text-[#0E6439]">
                    Need insights?
                  </span>{" "}
                  Ask the{" "}
                  <span className="text-[#2C2C2C] font-semibold">Synko AI</span>{" "}
                  for instant data and smart recommendations!
                </div>
                <div className="sm:w-[15%] flex justify-end w-[30%] h-[50px]">
                  <img src="/images/robot.png" alt="" className="h-full" />
                </div>
              </div>
            </Link>
            <hr />
            <div className="w-[100%]">
              <p className="text-[18px] md:text-[24px] mt-[10px] px-2 sm:px-4">
                Sales
              </p>
              <div className="px-2 sm:px-4 flex items-center justify-between w-[100%]">
                <div className="mt-[10px] relative z-10">
                  <CustomDateRangePicker onChange={handleDateRangeChange} />
                </div>
                <div className="md:flex items-center space-x-3 sm:w-fit hidden">
                  <Link
                    id="shadow"
                    href="/manage/items"
                    className="flex items-center justify-center whitespace-nowrap gap-2 border bg-white rounded-lg px-2 sm:px-4 text-[14px] py-2"
                  >
                    <BsTag className="text-[#7DE143] text-[20px]" />

                    <p>Add Item</p>
                  </Link>

                  <Link
                    id="shadow"
                    href="/manage/categories"
                    className="flex items-center justify-center whitespace-nowrap gap-2 border bg-white rounded-lg px-2 sm:px-4 text-[14px] py-2"
                  >
                    <GiKnifeFork className="text-[#7DE143] text-[20px]" />

                    <p>Add Category</p>
                  </Link>
                </div>
              </div>
            </div>
            {loading == true ? (
              <>
                <div className="min-h-[200px] w-full justify-center items-center flex">
                  <CSpinner color="text-black !w-[50px] !h-[50px]" />
                </div>
              </>
            ) : data && data?.graphData?.length > 0 ? (
              <>
                <div className="flex flex-col md:flex-row w-[100%]">
                  <div className="w-[100%] md:w-[50%]">
                    <p className="md:text-[20px] mt-12 px-2 sm:px-4">
                      Net Sale
                    </p>
                    <p className="text-[24px] md:text-[26px] font-bold text-[#868686] mt-2 px-2 sm:px-4">
                      {merchant?.currency?.symbol ?? <>&euro;</>}{" "}
                      {data?.orderData?.total_net_sales || 0}
                    </p>
                    <div>
                      <BasicLineChart
                        data={data?.graphData}
                        categoryKey="order_date_d"
                        seriesKey={["total_gross,Total Net"]}
                        currencySymbol={
                          merchant?.currency?.symbol || <>&euro;</>
                        }
                        isMultiMonth={isSpanningMoreThanOneMonth(dateRange)}
                      />
                    </div>
                  </div>

                  <div className="w-[2px] h-[400px] hidden md:flex bg-gray-300 mt-4"></div>

                  <div className="w-[100%] md:w-[50%] px-2 sm:px-4">
                    <p className="text-[18px] md:text-[24px] mt-12">
                      Payment type
                    </p>

                    {/* <div className="md:flex gap-4 mt-8 w-[100%] bg-[gray]">
                    <div style={{ width: perGraph?.cash + "%" }}>
                      <div
                        className={`h-[20px] rounded-[3px] bg-[#72D542]`}
                      ></div>
                      <div className="text-center text-[12px] mt-[5px]">
                        {perGraph?.cash + "%"}
                      </div>
                    </div>
                    <div style={{ width: perGraph?.card + "%" }}>
                      <div
                        className={`h-[20px] rounded-[3px] bg-[#44D35B]`}
                      ></div>
                      <div className="text-center text-[12px] mt-[5px]">
                        {perGraph?.card + "%"}
                      </div>
                    </div>
                    <div
                      className="bg-[red]"
                      style={{ width: perGraph?.other + "%" }}
                    >
                      <div
                        className={`h-[20px] rounded-[3px] bg-[#348708]`}
                      ></div>
                      <div className="text-center text-[12px] mt-[5px]">
                        {perGraph?.other + "%"}
                      </div>
                    </div>
                  </div> */}

                    <div className="flex flex-col md:flex-row gap-4 mt-8 w-[100%] p-4 rounded-md">
                      {/* Cash */}
                      <div className="flex-1">
                        <div className="border-2 border-[#E1E1E1] rounded-[3px]">
                          <div
                            style={{ width: perGraph?.cash + "%" }}
                            className="h-[20px] rounded-[3px] bg-[#72D542]"
                          ></div>
                        </div>
                        <div className="text-center text-[12px] mt-[5px]">
                          {perGraph?.cash + "%"}
                        </div>
                      </div>

                      {/* Card */}
                      <div className="flex-1">
                        <div className="border-2 border-[#E1E1E1] rounded-[3px]">
                          <div
                            style={{ width: perGraph?.card + "%" }}
                            className="h-[20px] rounded-[3px] bg-[#44D35B]"
                          ></div>
                        </div>
                        <div className="text-center text-[12px] mt-[5px]">
                          {perGraph?.card + "%"}
                        </div>
                      </div>

                      {/* Other */}
                      <div className="flex-1">
                        <div className="border-2 border-[#E1E1E1] rounded-[3px]">
                          <div
                            style={{ width: perGraph?.other + "%" }}
                            className="h-[20px] rounded-[3px] bg-[#348708]"
                          ></div>
                        </div>
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
                    <div className="px-2 sm:px-4">
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
                          <Link
                            href={`/sales/reports?pageName=${REPORT_PAGES.item_sales}&start=${dateRange[0]}&end=${dateRange[1]}`}
                            className="text-[13px] underline"
                          >
                            View More
                          </Link>
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
                    <div className="px-2 sm:px-4">
                      <div>
                        <p className="text-[18px] md:text-[24px] mt-4">
                          Categories
                        </p>
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
                                      (parseFloat(item?.total_sales) /
                                        maxCategorySales) *
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
                          <Link
                            href={`/sales/reports?pageName=${REPORT_PAGES.category_sales}&start=${dateRange[0]}&end=${dateRange[1]}`}
                            className="text-[13px] underline"
                          >
                            View More
                          </Link>
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
                    <div className="px-2 sm:px-4">
                      <div>
                        <p className="text-[18px] md:text-[24px] mt-4">
                          Order Type
                        </p>
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
                              (parseFloat(
                                data?.orderData?.total_dine_in_order_amount
                              ) /
                                maxOrderTypeSales) *
                              100
                            ).toFixed(0)}
                            item={"Dine In"}
                            index={0}
                          />
                          <BoxItem
                            cost={+data?.orderData?.total_takeaway_order_amount}
                            height={(
                              (parseFloat(
                                +data?.orderData?.total_takeaway_order_amount
                              ) /
                                maxOrderTypeSales) *
                              100
                            ).toFixed(0)}
                            item={"Takeaway"}
                            index={1}
                          />
                          <BoxItem
                            cost={totalDeliveryOrderAmount}
                            height={(
                              (parseFloat(totalDeliveryOrderAmount) /
                                maxOrderTypeSales) *
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
                            total_sold_items={
                              +data?.orderData?.total_dine_in_orders
                            }
                            index={0}
                          />
                          <ItemBoxItems
                            cost={+data?.orderData?.total_takeaway_order_amount}
                            item={"Takeaway"}
                            total_sold_items={
                              +data?.orderData?.total_takeaway_orders
                            }
                            index={1}
                          />
                          <ItemBoxItems
                            cost={totalDeliveryOrderAmount}
                            item={"Delivery"}
                            total_sold_items={totalDeliveryOrders}
                            index={2}
                          />
                        </div>
                        {/* <div className="flex justify-between mt-[20px]">
                        <Link href={"#"} className="text-[13px] underline">
                          View More
                        </Link>
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
            ) : (
              <div className="mt-[10px] px-[15px]">
                <NoData>
                  <h2 className="font-[500] text-[16px]">
                    No Transactions in This Time Frame
                  </h2>
                  <p className="text-[12px]">
                    No transactions took place during the time frame you
                    selected.
                  </p>
                </NoData>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserSubscription>
  );
}
