"use client";
import { IoSearch } from "react-icons/io5";
import SideMenu from "@/components/menus/SideMenu";
import { GlobalContext } from "@/context";
import { useContext, useEffect, useState } from "react";
import { getRequest } from "@/utils/apiFunctions";
import ReportModals from "@/components/reports/ReportModals";
import Table from "../../Table";

export default function Dipatch({ params, searchParams }) {
  const { merchant, user, setMerchant } = useContext(GlobalContext);

  const [dispatch, setDisPatch] = useState(0);

  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(searchParams?.datefrom);
  const [dateTo, setDateTo] = useState(searchParams?.dateto);
  const [query1, setQeury] = useState("today");

  // SALE BY DISPATCH STATEUS
  useEffect(() => {
    if (params?.dispatch === "dine-in") {
      setDisPatch(1);
    }
    if (params?.dispatch === "takeaway") {
      setDisPatch(2);
    }
    if (params?.dispatch === "delivery") {
      setDisPatch(3);
    }

    // adding date to search by date
    setDateFrom(searchParams?.datefrom);
    setDateTo(searchParams?.dateto);
  }, []);

  const [saleSummaryData, setSaleSummaryData] = useState();
  const [pageCurrent, setPageCurrent] = useState(1);
  const [metaData, setMetaData] = useState();

  const [searchProductValue, setsearchProductValue] = useState("");
  const [searchProductTableBody, setsearchTableBody] = useState([]);
  const [searchProductTableHeading, setsearchTableHeading] = useState([]);
  // categories
  const [dispatchCategoryTableBody, setdispatchCategoryTableBody] = useState(
    []
  );
  const [dispatchCategoryTableHeading, setdispatchCategoryTableHeading] =
    useState([]);
  const [searchCategoryValue, setsearchCategoryValue] = useState("");

  // refunded
  const [dispatchRefundedTableBody, setdispatchRefundedTableBody] = useState(
    []
  );
  const [dispatchRefundedTableHeading, setdispatchRefundedTableHeading] =
    useState([]);
  const [searchRefundValue, setsearchRefundValue] = useState("");

  // payment methods
  const [dispatchPaymentTableBody, setdispatchPaymentTableBody] = useState([]);
  const [dispatchPaymentTableHeading, setdispatchPaymentTableHeading] =
    useState([]);
  const [searchPaymentValue, setsearchPaymentValue] = useState("");

  // all Products
  const [AlltemsTableBody, setAllItemsTableBody] = useState([]);
  const [AlltemsTableHeading, setAlltemsTableHeading] = useState([]);

  // merchant
  const [searchMerchantValue, setSearchMerchantValue] = useState("");
  const [saleBydispatchType, setsaleBydispatchType] = useState([]);

  // table status

  const handleDateFromChange = (e) => {
    const newDateFrom = e.target.value;
    setDateFrom(newDateFrom);

    // Set Date To as the same or later
    if (!dateTo || newDateFrom > dateTo) {
      setDateTo(newDateFrom);
    }
  };

  // search search by date button
  const handleSubmitButton = () => {
    if (dateTo && dateFrom && typeof window !== "undefined") {
      allSellsByDispatchProduct();
      allSellsByDispatchCategory();
      allSellsByDispatchRefundItems();
      allSellsByDispatchPaymentMethod();
      allSellsByDispatchSummary();
      getAllItems();
    }
  };

  // GET SALE BY PRODUCT DISPATCH
  const allSellsByDispatchSummary = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/dispatch/${dispatch}?startDate=${dateFrom}&endDate=${dateTo}&search=${searchProductValue}`
    )
      .then((res) => {
        setSaleSummaryData(res?.data?.summary);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error case here
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const allSellsByDispatchProduct = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/dispatch/${dispatch}/products?startDate=${dateFrom}&endDate=${dateTo}&search=${searchProductValue}`
    )
      .then((res) => {
        let products = [];

        if (res?.data?.productsData.length != 0) {
          for (var x = 0; x < res?.data?.productsData?.length; x++) {
            let dataAry = Object.values(res?.data?.productsData[x]);
            products.push(dataAry);
          }
          const headings = Object.keys(res?.data?.productsData[0]);

          setsearchTableBody(products);
          setsearchTableHeading(headings);
        } else {
          setsearchTableBody([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error case here
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // payment method dispatches
  const allSellsByDispatchPaymentMethod = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/dispatch/${dispatch}/paymentMethod?startDate=${dateFrom}&endDate=${dateTo}&search=${searchPaymentValue}`
    )
      .then((res) => {
        let methods = [];

        if (res?.data?.paymentMethodData.length != 0) {
          for (var x = 0; x < res?.data?.paymentMethodData?.length; x++) {
            let dataAry = Object.values(res?.data?.paymentMethodData[x]);
            methods.push(dataAry);
          }
          const headings = Object.keys(res?.data?.paymentMethodData[0]);

          setdispatchPaymentTableBody(methods);
          setdispatchPaymentTableHeading(headings);
        } else {
          setdispatchPaymentTableBody([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error case here
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // search dispatch refund items
  const allSellsByDispatchRefundItems = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/dispatch/${dispatch}/refunded_items?startDate=${dateFrom}&endDate=${dateTo}&search=${searchRefundValue}`
    )
      .then((res) => {
        let products = [];
        if (res?.data?.refundedItemsData.length != 0) {
          for (var x = 0; x < res?.data?.refundedItemsData?.length; x++) {
            let dataAry = Object.values(res?.data?.refundedItemsData[x]);
            products.push(dataAry);
          }
          const headings = Object.keys(res?.data?.refundedItemsData[0]);

          setdispatchRefundedTableBody(products);
          setdispatchRefundedTableHeading(headings);
        } else {
          setdispatchRefundedTableBody([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error case here
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // dispatch category data
  const allSellsByDispatchCategory = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/dispatch/${dispatch}/categories?startDate=${dateFrom}&endDate=${dateTo}&search=${searchCategoryValue}`
    )
      .then((res) => {
        let categories = [];

        if (res?.data?.categoriesData.length != 0) {
          for (var x = 0; x < res?.data?.categoriesData?.length; x++) {
            let dataAry = Object.values(res?.data?.categoriesData[x]);
            categories.push(dataAry);
          }
          const headings = Object.keys(res?.data?.categoriesData[0]);

          setdispatchCategoryTableBody(categories);
          setdispatchCategoryTableHeading(headings);
        } else {
          setdispatchCategoryTableBody([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error case here
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getAllItems = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/sale/items?startDate=${dateFrom}&endDate=${dateTo}&page=${pageCurrent}`
    )
      .then((res) => {
        let products = [];

        if (res?.data?.result.length != 0) {
          // setMetaData(res?.data?.meta)
          for (var x = 0; x < res?.data?.result?.length; x++) {
            let dataAry = Object.values(res?.data?.result[x]);
            products.push(dataAry);
          }
          const headings = Object.keys(res?.data?.result[0]);

          setAllItemsTableBody(products);
          setAlltemsTableHeading(headings);
        } else {
          setAllItemsTableBody([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error case here
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const [modals, setModals] = useState(null);

  useEffect(() => {
    if (user !== null && merchant !== null) {
      if (dateTo && dateFrom) {
        // dispatches
        allSellsByDispatchProduct();
        allSellsByDispatchCategory();
        allSellsByDispatchPaymentMethod();
        allSellsByDispatchRefundItems();
        allSellsByDispatchSummary();
        getAllItems();
      }
    }
  }, [user, merchant, query1, dispatch]);

  const handleLoadMore = () => {
    if (pageCurrent >= metaData?.last_page) {
      setPageCurrent(pageCurrent);
      return;
    }
    setPageCurrent(pageCurrent + 1);
  };

  return (
    <div className="min-h-screen flex bg-[#171821] relative">
      <SideMenu />
      <ReportModals
        dateTo={dateTo}
        dateFrom={dateFrom}
        setModals={setModals}
        modals={modals}
      />
      <div className=" w-[100%] xl:pl-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6  text-black bg-[#171821]">
        <div className=" px-4 md:px-10 rounded-lg py-12 bg-gray-50 w-[100%] h-[calc(100vh-48px)] overflow-y-auto">
          <div className="flex">
            <p className="text-[28px] md:text-[33px]">
              {dispatch === 1 ? (
                <>DINE IN</>
              ) : (
                <>
                  {dispatch === 2 ? (
                    <>Takeaway</>
                  ) : (
                    <>{dispatch === 3 ? <>Delivery</> : <></>}</>
                  )}
                </>
              )}
            </p>
          </div>

          <hr className="mt-8" />

          <div className="flex flex-col w-[100%]">
            <div className="w-[100%] flex justify-between items-center my-[10px]">
              <p className="text-[18px] md:text-[24px] px-4 font-[500]">
                Overview
              </p>
              <div className="flex space-x-2 items-center">
                <div className="flex space-x-4 items-center">
                  <label>Date From</label>
                  <input
                    type="datetime-local"
                    value={dateFrom}
                    onChange={handleDateFromChange}
                    className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                  />
                </div>
                <div className="flex space-x-4 items-center">
                  <label>Date To</label>
                  <input
                    type="datetime-local"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!dateFrom && !dateTo) {
                      alert("Please select dates to proceed!");
                      return;
                    }
                    handleSubmitButton();
                  }}
                  className="p-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-[5px]"
                >
                  <IoSearch size={20} color="white" />
                </button>
              </div>
            </div>

            <hr />

            {dateFrom && dateTo ? (
              <>
                {/* tabs */}

                {/* tab 1 */}

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 p-4">
                  <div className="px-3 mt-3 bg-[white] py-5 bg-gradient-to-r from-[#7DE143] to-[#055938] outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex items-center justify-center flex-col">
                    <span className="font-bold text-white">GROSS TOTAL</span>
                    <span className="text-white">
                      {" "}
                      {saleSummaryData?.gross_total
                        ? saleSummaryData?.gross_total
                        : 0.0}
                    </span>
                  </div>

                  <div className="px-3 mt-3 bg-[white] py-5 outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex items-center justify-center flex-col">
                    <span className="font-bold">NET AMOUNT</span>
                    <span>
                      {" "}
                      {saleSummaryData?.net_Amount
                        ? saleSummaryData?.net_Amount
                        : 0.0}
                    </span>
                  </div>
                </div>

                <div className="text-white text-center p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between">
                  <span className="flex items-center">Products</span>
                  <div className="flex justify-end">
                    <input
                      className="border p-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black"
                      placeholder="Search..."
                      value={searchMerchantValue}
                      onChange={(e) => {
                        setSearchMerchantValue(e.target.value);
                      }}
                    ></input>
                  </div>
                </div>

                {/* table for Sell by Store */}

                <Table
                  tableBody={searchProductTableBody}
                  tableHeading={searchProductTableHeading}
                />

                {/* category dispatch by data */}
                <div className="text-white text-center mt-4 p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between">
                  <span className="flex items-center">Categories</span>
                  <div className="flex justify-end">
                    <input
                      className="border p-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black"
                      placeholder="Search..."
                      value={searchMerchantValue}
                      onChange={(e) => {
                        setSearchMerchantValue(e.target.value);
                      }}
                    ></input>
                  </div>
                </div>

                {/* table for Sell by Store */}

                <Table
                  tableBody={dispatchCategoryTableBody}
                  tableHeading={dispatchCategoryTableHeading}
                />

                {/* refunded dispatch by data */}
                {dispatchRefundedTableHeading.length > 0 ? (
                  <>
                    <div className="text-white text-center mt-4 p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between">
                      <span className="flex items-center">Refunded Items</span>
                      <div className="flex justify-end">
                        <input
                          className="border p-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black"
                          placeholder="Search..."
                          value={searchRefundValue}
                          onChange={(e) => {
                            setsearchRefundValue(e.target.value);
                          }}
                        ></input>
                      </div>
                    </div>

                    {/* table for Sell by Store */}

                    <Table
                      tableBody={dispatchRefundedTableBody}
                      tableHeading={dispatchRefundedTableHeading}
                    />
                  </>
                ) : (
                  <></>
                )}

                {/* Payment Methods dispatch by data */}
                <div className="text-white text-center mt-4 p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between">
                  <span className="flex items-center">Payment Method</span>
                  <div className="flex justify-end">
                    <input
                      className="border p-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black"
                      placeholder="Search..."
                      value={searchPaymentValue}
                      onChange={(e) => {
                        setsearchPaymentValue(e.target.value);
                      }}
                    ></input>
                  </div>
                </div>

                {/* table for Sell by Store */}

                <Table
                  tableBody={dispatchPaymentTableBody}
                  tableHeading={dispatchPaymentTableHeading}
                />

                {/* All Sells */}
                <div className="text-white text-center mt-4 p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between">
                  <span className="flex items-center">All Sells</span>
                  <div className="flex justify-end">
                    <input
                      className="border p-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black"
                      placeholder="Search..."
                      value={searchMerchantValue}
                      onChange={(e) => {
                        setSearchMerchantValue(e.target.value);
                      }}
                    ></input>
                  </div>
                </div>

                {/* table for Sell by Store */}

                <Table
                  tableBody={AlltemsTableBody}
                  tableHeading={AlltemsTableHeading}
                />

                {/* {pageCurrent >= metaData?.last_page ? (
                                        <></>
                                        ) : (
                                        <>
                                            <div className="my-[20px] flex justify-center">
                                            <button
                                                onClick={() => {
                                                handleLoadMore();
                                                }}
                                                className="cursor-pointer px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                                            >
                                                Load More
                                            </button>
                                            </div>
                                        </>
                                        )} */}
              </>
            ) : (
              <>
                <p className="text-[16px] text-center mt-5">
                  Select Date First
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
