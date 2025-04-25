"use client";
import { IoSearch } from "react-icons/io5";
import SideMenu from "@/components/menus/SideMenu";
import { GlobalContext } from "@/context";
import { use, useContext, useEffect, useState } from "react";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import ReportModals from "@/components/reports/ReportModals";
import Checkbox from "@mui/material/Checkbox";
import { csvDownloader } from "@/utils/csv_downloader";
import { FaFileExport } from "react-icons/fa6";
import { IoArrowBackOutline } from "react-icons/io5";
import Link from "next/link";
import { IoMdArrowDropdown } from "react-icons/io";
import Modal from "@/components/alerts/index";
import Swal from "sweetalert2";
export default function Dipatch({ params, searchParams }) {
  const { merchant, user, setMerchant } = useContext(GlobalContext);
  const [pageTitle, setPageTitle] = useState();
  const [product, setproductValue] = useState("");
  const [product_exact, setProduct_exact] = useState("");
  const [employe, setEmploye] = useState("");
  const [employID, setemployID] = useState("");
  const [categoryID, setcategoryID] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [pageCurrent, setPageCurrent] = useState(1);
  const [metaData, setMetaData] = useState();
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(searchParams?.datefrom);
  const [dateTo, setDateTo] = useState(searchParams?.dateto);
  const [query1, setQeury] = useState("today");
  const [order_status, setOrder_status] = useState("");
  const [order_type, setOrder_type] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedOrderID, setSelectedOrderID] = useState([]);
  const [isOpenAlert, setOpenALert] = useState(false);
  const [isOpenAlertMsg, setOpenALertMsg] = useState("");
  const [saleSummaryData, setSaleSummaryData] = useState();
  const [ProductTableBody, setProductTableBody] = useState("");
  const [Productslist, setProductslist] = useState("");
  const [ProductTableHeading, setProductTableHeading] = useState("");
  const [searchPaymentValue, setsearchPaymentValue] = useState("");
  const [loadingManageBtn, setLoadingManageBtn] = useState(false);
  const [checkAll, setcheckAll] = useState(false);
  const [itemToDlt, setItemToDlt] = useState([]);
  const [checkBoxAry, seCheckBoxAry] = useState([]);

  // get top items

  // table status

  // top items table state
  const [topItemsTableBody, setTopItemsTableBody] = useState([]);
  const [topItemsTableHeading, setTopItemsTableHeading] = useState([]);
  const [pageCurrent_topItem, setPageCurrent_topItem] = useState(1);
  const [meta_topItem, setmeta_topItem] = useState({});

  // table status

  // SALE BY DISPATCH STATEUS
  useEffect(() => {
    // adding date to search by date
    setDateFrom(searchParams?.datefrom);
    setDateTo(searchParams?.dateto);
  }, []);

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
      allProducts();
    }
  };

  const allProducts = () => {
    setLoading(true);
    let employeid = "";
    if (searchParams?.employe_id == "true") {
      employeid = params?.product;
    }

    const url = `/merchant/${merchant?.id}/sale/items?startDate=${dateFrom}&endDate=${dateTo}&product=${product}&paid_by=${paidBy}&employe=${employe}&employID=${employeid}&categoryID=${categoryID}&page=${pageCurrent}&order_status=${order_status}&searchType=${searchType}&searchValue=${searchValue}&order_type=${order_type}&exact_name=${product_exact}`;
    getRequest(url)
      .then((res) => {
        let products = [];
        let checksAry = [];
        if (res?.data?.result.length > 0) {
          setMetaData(res?.data?.meta);
          setSaleSummaryData(res?.data?.groundData);
          for (var x = 0; x < res?.data?.result?.length; x++) {
            let dataAry = Object.values(res?.data?.result[x]);
            products.push(dataAry);
            let obj = { id: res?.data?.result[x]?.id, checked: false };
            checksAry.push(obj);
          }
          const headings = Object.keys(res?.data?.result[0]);

          setProductTableHeading(headings);
          if (pageCurrent === 1) {
            setProductslist(res?.data?.result);
            setProductTableBody(products);
            seCheckBoxAry(checksAry);
          } else {
            setProductslist((prev) => {
              return [...prev, ...res?.data?.result];
            });
            setProductTableBody((prev) => {
              return [...prev, ...products];
            });
            seCheckBoxAry((prev) => {
              return [...prev, ...checksAry];
            });
          }
          if (searchParams?.employe_id == "true") {
            setPageTitle(res?.data?.result[0]["Employe"]);
          }

          if (searchParams?.category_id == "true") {
            setPageTitle(res?.data?.result[0]["Category"]);
          }
        } else {
          setProductTableBody([]);
          setProductslist([]);
          setPageTitle("");
          setSaleSummaryData();
          seCheckBoxAry([]);
        }

        setOpenALert(false);
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
        if (searchParams?.product == "true") {
          let productName = params?.product;
          productName = productName.replace(/-/g, " ");
          if (searchParams?.exact == "true") {
            setProduct_exact(productName);
            setPageTitle(productName);
            setSearchType("item");
          } else {
            setproductValue(productName);
          }
        }

        if (searchParams?.employe_id == "true") {
          setemployID(params?.product);
        }

        if (searchParams?.category_id == "true") {
          setcategoryID(params?.product);
        }

        // if cash or card
        if (params?.product == "card") {
          setPaidBy(2);
          setPageTitle("Card");
        } else if (params?.product == "cash") {
          setPaidBy(1);
          setPageTitle("Cash");
        } else if (params?.product == "foc") {
          setPaidBy(4);
          setPageTitle("FOC");
        } else if (params?.product == "foc") {
          setPaidBy(4);
          setPageTitle("FOC");
        } else if (params?.product == "uber") {
          setPaidBy(5);
          setPageTitle("UBER");
        } else if (params?.product == "door-dash") {
          setPaidBy(7);
          setPageTitle("Door Dash");
        }
        // MrBaksh

        // get all products by dispatch
        if (params?.product == "dine-in") {
          setOrder_type(1);
          setPageTitle("Dine IN");
        } else if (params?.product == "takeaway") {
          setOrder_type(2);
          setPageTitle("Takeaway");
        } else if (params?.product == "delivery") {
          setOrder_type(3);
          setPageTitle("Delivery");
        }
      }
    }
  }, [
    user,
    merchant,
    query1,
    product,
    paidBy,
    categoryID,
    pageCurrent,
    order_status,
    searchValue,
    order_type,
    product_exact,
  ]);

  useEffect(() => {
    allProducts();
  }, [
    user,
    merchant,
    query1,
    product,
    paidBy,
    categoryID,
    employID,
    pageCurrent,
    order_status,
    searchValue,
    order_type,
    product_exact,
  ]);

  const exportToCSV = async () => {
    // Productslist
    csvDownloader(Productslist, "all Products");
  };

  const handleLoadMore = () => {
    if (metaData?.hasMore == "false") {
      setPageCurrent(pageCurrent);
      return;
    }
    setPageCurrent(pageCurrent + 1);
  };

  const handleFilterByChange = (selector, value) => {
    if (selector == 1) {
      // if refund
      if (value != "0") {
        setPageCurrent(1);
        setOrder_status(value);
      } else {
        setOrder_status("");
      }
    } else if (selector == 2) {
      if (value != "0") {
        setPageCurrent(1);
        setPaidBy(value);
      } else {
        setPaidBy("");
      }
    }

    if (selector == 3) {
      if (value != "0") {
        setPageCurrent(1);
        setSearchType(value);
      } else {
        setSearchValue("");
      }
    }

    if (selector == 4) {
      if (value != "0") {
        setOrder_type(value);
        setPageCurrent(1);
      } else {
        setOrder_type("");
      }
    }
  };

  function handleManageordersFun() {
    let inputs = {
      ids: selectedOrderID,
    };

    setLoadingManageBtn(true);
    postRequest(`/merchant/${merchant.id}/order`, inputs)
      .then(async (res) => {
        if (res.status == 200) {
          Swal.fire({
            text: res.data.message,
            icon: "success",
          });

          allProducts();
          setSelectedOrderID([]);
        } else {
          Swal.fire({
            text: res.data.message,
            icon: "error",
          });
          setOpenALert(false);
        }
      })
      .catch((err) => {
        if (err?.response?.data?.message) {
          Swal.fire({
            text: err?.response?.data?.message,
            icon: "error",
          });
        }
        setOpenALert(false);
      })
      .finally(() => {
        setLoadingManageBtn(false);
      });
  }

  const handleAction = () => {
    handleManageordersFun();
  };

  const handleSelectAllAction = (e) => {
    let isChecked = e.target.checked;

    let dataChekc = checkBoxAry;
    if (isChecked == true) {
      if (dataChekc.length > 0) {
        dataChekc.forEach((elm) => {
          elm.checked = true;
        });
      }
    } else if (isChecked == false) {
      if (dataChekc.length > 0) {
        dataChekc.forEach((elm) => {
          elm.checked = false;
        });
      }
    }

    seCheckBoxAry((prevItems) => [...dataChekc]);
    let idsOfChecked = [];
    dataChekc.forEach((item, index) => {
      if (item.checked == true) {
        idsOfChecked.push(item.id);
      }
    });

    setSelectedOrderID((prevItems) => [...idsOfChecked]);
  };

  const handleCheckBox = (e, id) => {
    const isChecked = e.target.checked;
    let dataChekc = checkBoxAry;
    if (isChecked == true) {
      dataChekc.forEach((elm) => {
        if (elm.id == id) {
          elm.checked = true;
        }
      });
    } else {
      dataChekc.forEach((elm) => {
        if (elm.id == id) {
          elm.checked = false;
        }
      });
    }
    seCheckBoxAry((prevItems) => [...dataChekc]);
    let idsOfChecked = [];
    dataChekc.forEach((item, index) => {
      if (item.checked == true) {
        idsOfChecked.push(item.id);
      }
    });

    setSelectedOrderID((prevItems) => [...idsOfChecked]);
  };

  useEffect(() => {
    console.log("check box array ", selectedOrderID);
  }, [selectedOrderID]);

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
            <Link
              href="/reports/sales/sales-overview"
              className="rounded-full w-[50px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white text-[25px] flex items-center justify-center"
            >
              <IoArrowBackOutline />
            </Link>
            <p className="text-[28px] md:text-[33px] uppercase ml-3">
              {pageTitle ? pageTitle : ""}
            </p>
          </div>

          <hr className="mt-8" />

          <div className="flex flex-col w-[100%]">
            <div className="w-[100%] flex flex-col lg:flex-row justify-between px-4 lg:items-center my-[10px]">
              <p className="text-[18px] md:text-[24px] font-[500]">Overview</p>
              <div className="flex flex-col lg:flex-row gap-2 justify-between lg:items-center">
                <div className="flex lg:space-x-4 justify-between lg:items-center">
                  <label>Date From</label>
                  <input
                    type="datetime-local"
                    value={dateFrom}
                    onChange={handleDateFromChange}
                    className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                  />
                </div>
                <div className="flex lg:space-x-4 justify-between lg:items-center">
                  <label>Date To</label>
                  <input
                    type="datetime-local"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  if (!dateFrom && !dateTo) {
                    alert("Please select dates to proceed!");
                    return;
                  }
                  handleSubmitButton();
                }}
                className="p-[8px] bg-gradient-to-r w-fit from-[#7DE143] to-[#055938] rounded-[5px]"
              >
                <IoSearch size={20} color="white" />
              </button>
            </div>

            <hr />

            {dateFrom && dateTo ? (
              <>
                {/* tabs */}

                {/* tab 1 */}

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 p-4">
                  <div className="px-3 mt-3 bg-[white] py-5 outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex items-center justify-center flex-col">
                    <span className="font-bold">GROSS TOTAL</span>
                    <span>
                      {loading ? ( // Render the loader if isLoading is true
                        <div className="flex items-center justify-center py-2">
                          <div className="animate-spin rounded-full h-7 w-7 border-t-4 border-b-4 border-[#7DE143] to-[#055938]"></div>
                        </div>
                      ) : (
                        <>
                          {saleSummaryData?.gross_total
                            ? saleSummaryData?.gross_total
                            : 0.0}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="px-3 mt-3 bg-[white] py-5 outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex items-center justify-center flex-col">
                    <span className="font-bold">NET AMOUNT</span>
                    <span>
                      {loading ? ( // Render the loader if isLoading is true
                        <div className="flex items-center justify-center py-2">
                          <div className="animate-spin rounded-full h-7 w-7 border-t-4 border-b-4 border-[#7DE143] to-[#055938]"></div>
                        </div>
                      ) : (
                        <>
                          {saleSummaryData?.net_Amount
                            ? saleSummaryData?.net_Amount
                            : 0.0}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Payment Methods dispatch by data */}
                {ProductTableHeading ? (
                  <>
                    <div className="flex flex-col md:flex-row gap-2 justify-between">
                      <div className="ml-4 flex md:flex-col justify-between md:justify-normal">
                        Order Status
                        <select
                          id="sort-by"
                          name="sort-by"
                          className="px-4 w-[150px] md:w-fit py-3 border outline-none rounded-lg bg-white text-black ml-2"
                          onChange={(e) => {
                            handleFilterByChange(1, e.target.value);
                          }}
                        >
                          <option value="0">Select</option>
                          <option value="4">Ready</option>
                          <option value="7">Completed</option>
                          <option value="8">Canceled</option>
                          <option value="9">voided</option>
                          <option value="10">Refund</option>
                          {/* <option value="item">Dine in</option>
                                                <option value="item">Take Away</option>
                                                <option value="item">Cash</option>
                                                <option value="item">Card</option> */}
                        </select>
                      </div>
                      <div className="ml-4 flex md:flex-col justify-between md:justify-normal">
                        Payment Type
                        {/* MrBaksh */}
                        <select
                          id="sort-by"
                          name="sort-by"
                          className="px-4 w-[150px] md:w-fit py-3 border outline-none rounded-lg bg-white text-black ml-2"
                          onChange={(e) => {
                            handleFilterByChange(2, e.target.value);
                          }}
                          value={paidBy}
                        >
                          <option value="0">Select</option>
                          <option value="1">Cash</option>
                          <option value="2">Card</option>
                          <option value="4">FOC</option>
                          {/* <option value="5">UBER</option>
                                                <option value="7">Door Dash</option> */}
                        </select>
                      </div>
                      <div className="ml-4 flex md:flex-col justify-between md:justify-normal">
                        Order Type
                        <select
                          id="sort-by"
                          name="sort-by"
                          className="px-4 w-[150px] md:w-fit py-3 border outline-none rounded-lg bg-white text-black ml-2"
                          onChange={(e) => {
                            handleFilterByChange(4, e.target.value);
                          }}
                          value={order_type}
                        >
                          <option value="0">Select</option>
                          <option value="1">Dine in</option>
                          <option value="2">Takeaway</option>
                          <option value="3">Delivery</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex mt-3">
                      <select
                        id="sort-by"
                        name="sort-by"
                        className="px-4 py-3  border outline-none rounded-lg bg-white text-black ml-2"
                        onChange={(e) => {
                          handleFilterByChange(3, e.target.value);
                        }}
                      >
                        <option value="0">Select</option>
                        <option value="category">Search By Category</option>
                        <option value="employe">Search By Employe </option>
                        <option value="item">Search By Item </option>
                      </select>

                      <input
                        className="w-full border p-2 ml-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => {
                          setSearchValue(e.target.value);
                        }}
                      ></input>
                    </div>

                    <div className="text-white text-center mt-4 p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between">
                      <span className="flex items-center">All Sale</span>
                      <div className="flex justify-end">
                        <div className="flex">
                          <div className="flex justify-center items-center ml-2">
                            <button
                              title="Export in CSV"
                              onClick={() => {
                                exportToCSV("export_merchant");
                              }}
                            >
                              <FaFileExport className="text-[20px]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* table for Sell by Store */}
                    {loading ? ( // Render the loader if isLoading is true
                      <div className="flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-7 w-7 border-t-4 border-b-4 border-[#7DE143] to-[#055938]"></div>
                      </div>
                    ) : (
                      <>
                        {/* <Table tableBody={ProductTableBody} tableHeading={ProductTableHeading} /> */}

                        {/* table is here */}
                        <div className="relative overflow-x-auto overflow-y-hidden">
                          <table className="w-full border text-left">
                            <thead>
                              <tr className="bg-[#95E7CF] ">
                                <th className="px-7 py-3 text-[16px] font-semibold  flex items-center">
                                  <Checkbox
                                    onChange={(e) => {
                                      handleSelectAllAction(e);
                                    }}
                                  />
                                  <span>#ID</span>
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Employe
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Item Name
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Category
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Gross Total
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Refund Amount
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Item Price
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Tax
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Discount
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Qantity
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Refund Items
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Canceled
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Served
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Wasted
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Preparaing
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Ready
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Refund Reason
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  FOC Reason
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Merchant Name
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Order Date
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Order Time
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Payment Method
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Order Status
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold flex">
                                  Paid Status
                                  <div className="cursor-pointer ml-2">
                                    <IoMdArrowDropdown
                                      onClick={() => {
                                        setOpenALert(true);
                                      }}
                                    />
                                  </div>
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Order Type
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Kitchen Status
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {Productslist?.map((elm, index) => {
                                return (
                                  <tr
                                    key={index}
                                    className="border-b bg-white text-[14px]"
                                  >
                                    <td
                                      key={index + 1}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      <Checkbox
                                        onChange={(e) => {
                                          handleCheckBox(e, elm?.id);
                                        }}
                                        checked={
                                          checkBoxAry[index]?.checked == true
                                            ? true
                                            : false
                                        }
                                      />
                                      <span>{elm?.id}</span>
                                    </td>
                                    <td
                                      key={index + 2}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Employe}
                                    </td>
                                    <td
                                      key={index + 3}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Item_Name}
                                    </td>
                                    <td
                                      key={index + 4}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Category}
                                    </td>

                                    <td
                                      key={index + 5}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Gross_Total}
                                    </td>
                                    <td
                                      key={index + 6}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Refund_Amount}
                                    </td>
                                    <td
                                      key={index + 7}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Item_Price}
                                    </td>
                                    <td
                                      key={index + 8}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Tax}
                                    </td>
                                    <td
                                      key={index + 10}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Discount}
                                    </td>
                                    <td
                                      key={index + 9}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Qantity}
                                    </td>
                                    <td
                                      key={index + 11}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Refund_Items}
                                    </td>
                                    <td
                                      key={index + 12}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Canceled}
                                    </td>
                                    <td
                                      key={index + 13}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Served}
                                    </td>
                                    <td
                                      key={index + 14}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Wasted}
                                    </td>
                                    <td
                                      key={index + 15}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Preparaing}
                                    </td>
                                    <td
                                      key={index + 16}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Ready}
                                    </td>
                                    <td
                                      key={index + 17}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Refund_Reason}
                                    </td>
                                    <td
                                      key={index + 17}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.foc_reason}
                                    </td>
                                    <td
                                      key={index + 18}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Merchant_Name}
                                    </td>
                                    <td
                                      key={index + 19}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Order_Date}
                                    </td>
                                    <td
                                      key={index + 21}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Order_Time}
                                    </td>
                                    <td
                                      key={index + 232}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Payment_Method}
                                    </td>
                                    <td
                                      key={index + 23}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Order_Status}
                                    </td>
                                    <td
                                      key={index + 24}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      <div className="flex justify-center items-center">
                                        {elm?.Paid_Status}
                                        {/* <div key={35 + index} className="cursor-pointer">
                                                                                    <IoMdArrowDropdown onClick={() => {
                                                                                        setOpenALert(true)
                                                                                        setSelectedOrderID((prevItems) => [elm?.id]);
                                                                                    }}
                                                                                    />
                                                                                </div> */}
                                      </div>
                                    </td>
                                    <td
                                      key={index + 30}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Order_Type}
                                    </td>
                                    <td
                                      key={index + 33}
                                      className="px-7 py-2 lg:py-2 whitespace-nowrap"
                                    >
                                      {elm?.Kitchen_Status}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}

                    {pageCurrent >= metaData?.totalPages ? (
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
                    )}

                    {/* top items */}
                  </>
                ) : (
                  <>
                    <p className="text-[16px] text-center mt-5">
                      No Data Found
                    </p>
                  </>
                )}
              </>
            ) : (
              <>
                <p className="text-[16px] text-center mt-5">
                  Select Date First
                </p>
              </>
            )}
          </div>

          <Modal
            isOpenAlert={isOpenAlert}
            setOpenALert={setOpenALert}
            heading={"Warning"}
            modalType={"warning"}
            description="Would you want to manage?"
            handleAction={handleAction}
            loading={loadingManageBtn}
          />
        </div>
      </div>
    </div>
  );
}
