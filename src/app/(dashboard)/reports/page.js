"use client";
import { IoSearch } from "react-icons/io5";
import SideMenu from "@/components/menus/SideMenu";
import { GlobalContext } from "@/context";
import { useContext, useEffect, useState } from "react";
import { getRequest } from "@/utils/apiFunctions";
import ReportModals from "@/components/reports/ReportModals";
import Tabs from "@/components/Tabs/tabs";
import Table from "./sales/sales-overview/Table";
import { loadMore } from "@/utils/helper";
import { useRef } from "react";
import HorizontalBarGraph from "@/components/Charts/gage";
import Link from "next/link";

// import MyChart from '@/components/Charts/horizontalBarChart'
import { FaFileExport } from "react-icons/fa6";

import { lastFiveDaysSDate, todayDate } from "@/utils/Dates";
import { csvDownloader } from "@/utils/csv_downloader";

export default function Reports() {
  const { merchant, user, setMerchant } = useContext(GlobalContext);

  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(lastFiveDaysSDate);
  const [dateTo, setDateTo] = useState(todayDate);
  const [query, setQeury] = useState("today");
  const [saleSummaryData, setSaleSummaryData] = useState();

  const [saleByCategoryTableBody, setsaleByCategoryTableBody] = useState([]);
  const [saleByCategory, setsaleByCategory] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [SaleByEmployeData, setSaleByEmployeData] = useState({});
  const [SaleByEmployeTableData, setSaleByEmployeTableData] = useState({});
  const [SaleByEmploye, setSaleByEmploye] = useState({});
  const [SaleByEmployeTableHeading, setSaleByEmployeTableHeadings] = useState(
    {}
  );
  const [saleByItemTableData, setsaleByItemTableData] = useState([]);
  const [saleByItem, setsaleByItem] = useState([]);
  const [saleByItemTableBodyHeading, setsaleByItemTableBodyHeading] = useState(
    []
  );
  const [searchSaleByItem, setsearchSaleByItem] = useState();
  const [searchByEmployeeValue, setsearchByEmployeeValue] = useState();
  const [saleByCategoryTableHeading, setsaleByCategoryTableHeading] = useState(
    []
  );
  const [searchByCategoryValue, setsearchByCategoryValue] = useState("");
  const [saleItemSummaryOverview, setSalesItemSummaryOverview] = useState({});

  const [
    saleByPaymentMethodTableBodyData,
    setSaleByPaymentMethodTableBodyData,
  ] = useState([]);
  const [saleByPaymentMethodHeading, setSaleByPaymentMethodHeading] = useState(
    []
  );
  const [saleByPaymentMethod, setSaleByPaymentMethod] = useState([]);

  // merchant
  const [searchMerchantValue, setSearchMerchantValue] = useState("");
  const [saleBydispatchType, setsaleBydispatchType] = useState([]);
  const [saleBydispatchTypeHeading, setsaleBydispatchTypeHeading] = useState(
    []
  );
  const [saleBydispatch, setsaleBydispatch] = useState([]);

  // top categories
  const [topCategorisTableBody, setTopCategorisTableBody] = useState([]);
  const [topCategorisTableHeading, setTopCategorisTableHeading] = useState([]);
  const [rushHourHeading, setRushHourHeading] = useState();
  const [topCategorislist, settopCategorislist] = useState([]);
  const [topSaleSummary, setTopSaleSummary] = useState({});
  const [searchTopCategory, setsearchTopCategory] = useState("");
  const [searchRushHour, setsearchRushHour] = useState("");

  // top item sates
  const [topItemsTableHeading, settopItemsTableHeading] = useState([]);
  const [topItemsTableBody, settopItemsTableBody] = useState([]);
  const [searchTopItems, setsearchTopItems] = useState("");
  const [topItemsList, settopItemsList] = useState([]);

  // tabs data userState
  const [tabs_heading, setTabs] = useState([
    { value: "Sales Summary", id: 0, selected: true },
    { value: "Sales Item Summary", id: 1, selected: false },
    { value: "Payment Method", id: 2, selected: false },
    { value: "Top Sales", id: 4, selected: false },
    { value: "Sale By Employee", id: 3, selected: false },
    // { value: "Employee Attendence", id: 4, selected: false },
    // { value: "Discount Details", id: 4, selected: false },
    // { value: "Refund Details", id: 5, selected: false }
  ]);
  const [tab_status, setTabStatus] = useState(0);

  // table status
  const [saleByMerchantTableBody, set_saleByMerchantTableBody] = useState();
  const [rushHourTableBody, set_RushHourTableBody] = useState();
  const [saleByMerchant, set_saleByMerchan] = useState([]);
  const [rushHour, set_RushHour] = useState([]);
  const [saleByMerchantTableHeading, set_saleByMerchantTableHeading] = useState(
    []
  );

  const [topCategoreis, setTopCategoreis] = useState([]);
  const [searchTrendingCategories, setSearchTrendingCategories] = useState("");
  const [topCategoreisProducts, settopCategoreisProducts] = useState([]);
  const [noDataFoundMsg, setnoDataFoundMsg] = useState(null);
  const [topCategoreisBar, setTopCategoreisBar] = useState([]);
  const [topCategoreisProductsBar, settopCategoreisProductsBar] = useState([]);

  const handleDateFromChange = (e) => {
    const newDateFrom = e.target.value;
    setDateFrom(newDateFrom);

    // Set Date To as the same or later
    if (!dateTo || newDateFrom > dateTo) {
      setDateTo(newDateFrom);
    }
  };

  const handleSubmitButton = () => {
    if (dateTo && dateFrom && typeof window !== "undefined") {
      get_SaleByMerchantData();
      getSalesOverView();
      getSalesItemSummary();

      saleByEmployeeData();
      dispatchTypeSell();
      getSaleByCategoryData();
      getSalesItemSummaryOverviw();
      SaleByPaymentMethods();
      topCategories();
      getTopItems();
      get_RushHourCategoryGage();
      get_RushHourCategoryBar();
    }
  };

  // get get_SaleByMerchantData2
  const get_SaleByMerchantData = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/sale_by_merchant?startDate=${dateFrom}&endDate=${dateTo}&search=${searchMerchantValue}`
    )
      .then((res) => {
        let merchatAry = [];

        if (res?.data?.result.length != 0) {
          set_saleByMerchan(res?.data?.result);
          for (var x = 0; x < res?.data?.result?.length; x++) {
            let dataAry = Object.values(res?.data?.result[x]);
            merchatAry.push(dataAry);
          }
          const headings = Object.keys(res?.data?.result[0]);
          set_saleByMerchantTableHeading(headings);
          set_saleByMerchantTableBody(merchatAry);
        } else {
          set_saleByMerchantTableBody([]);
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

  const get_RushHourCategoryGage = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/top/category/peekhours/gage?startDate=${dateFrom}&endDate=${dateTo}&categorySearch=${searchTrendingCategories}`
    )
      .then((res) => {
        if (res?.data?.result.length != 0) {
          setTopCategoreis(res?.data?.result);
          settopCategoreisProducts(res?.data?.prodcutsDataAry);
        } else {
          setTopCategoreis([]);
          settopCategoreisProducts([]);
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

  const get_RushHourCategoryBar = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/top/category/peekhours/bar?startDate=${dateFrom}&endDate=${dateTo}`
    )
      .then((res) => {
        if (res?.data?.result.length != 0) {
          setTopCategoreisBar(res?.data?.result);
          settopCategoreisProductsBar(res?.data?.prodcutsDataAry);
        } else {
          setTopCategoreisBar([]);
          settopCategoreisProductsBar([]);
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

  const get_RushHour = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/top/category/peekhours?startDate=${dateFrom}&endDate=${dateTo}&search=${searchRushHour}`
    )
      .then((res) => {
        let merchatAry = [];

        if (res?.data?.result.length != 0) {
          set_saleByMerchan(res?.data?.result);
          for (var x = 0; x < res?.data?.result?.length; x++) {
            let dataAry = Object.values(res?.data?.result[x]);
            merchatAry.push(dataAry);
          }
          const headings = Object.keys(res?.data?.result[0]);
          setRushHourHeading(headings);
          set_RushHourTableBody(merchatAry);
        } else {
          set_RushHourTableBody([]);
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

  // get sale by category data
  const getTopItems = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/top/item/sales?startDate=${dateFrom}&endDate=${dateTo}&searchTopItems=${searchTopItems}`
    )
      .then((res) => {
        let itemsAry = [];

        if (res?.data?.result.length != 0) {
          settopItemsList(res?.data?.result);
          for (var x = 0; x < res?.data?.result?.length; x++) {
            // console.log(" top cap data ", res?.data?.result[x]);
            let dataAry = Object.values(res?.data?.result[x]);
            itemsAry.push(dataAry);
          }

          // setsaleByCategory(res?.data?.result)
          const headings = Object.keys(res?.data?.result[0]);
          settopItemsTableBody(itemsAry);
          settopItemsTableHeading(headings);
        } else {
          settopItemsTableBody([]);
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
  const topCategories = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/top/category/sales?startDate=${dateFrom}&endDate=${dateTo}&searchTopCategory=${searchTopCategory}`
    )
      .then((res) => {
        let catAry = [];
        setTopSaleSummary(res?.data?.topSalesSummary);
        if (res?.data?.demandingCategory.length != 0) {
          settopCategorislist(res?.data?.demandingCategory);
          for (var x = 0; x < res?.data?.demandingCategory?.length; x++) {
            // console.log(" top cap data ", res?.data?.demandingCategory[x]);
            let dataAry = Object.values(res?.data?.demandingCategory[x]);
            catAry.push(dataAry);
          }
          // setsaleByCategory(res?.data?.result)
          const headings = Object.keys(res?.data?.demandingCategory[0]);
          setTopCategorisTableBody(catAry);
          setTopCategorisTableHeading(headings);
        } else {
          setTopCategorisTableBody([]);
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
  // get sale by category data
  const getSaleByCategoryData = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/sale_by_category?startDate=${dateFrom}&endDate=${dateTo}&search=${searchByCategoryValue}`
    )
      .then((res) => {
        let catAry = [];

        if (res?.data?.result.length != 0) {
          for (var x = 0; x < res?.data?.result?.length; x++) {
            let dataAry = Object.values(res?.data?.result[x]);
            catAry.push(dataAry);
          }
          setsaleByCategory(res?.data?.result);
          const headings = Object.keys(res?.data?.result[0]);
          setsaleByCategoryTableBody(catAry);
          setsaleByCategoryTableHeading(headings);
        } else {
          setsaleByCategoryTableBody([]);
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

  // dispatch type sell
  const dispatchTypeSell = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/dispatch_type?startDate=${dateFrom}&endDate=${dateTo}`
    )
      .then((res) => {
        let dispatchs = [];

        if (res?.data?.result.length > 0) {
          for (var x = 0; x < res?.data?.result?.length; x++) {
            setsaleBydispatch(res?.data?.result);
            let dataAry = Object.values(res?.data?.result[x]);
            dispatchs.push(dataAry);
          }

          const headings = Object.keys(res?.data?.result[0]);
          setsaleBydispatchType(dispatchs);
          setsaleBydispatchTypeHeading(headings);
        } else {
          setsaleBydispatchType([]);
          setsaleBydispatchTypeHeading([]);
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

  // Sale Overview Data
  const getSalesOverView = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/sales_overview?startDate=${dateFrom}&endDate=${dateTo}`
    )
      .then((res) => {
        setSaleSummaryData(res.data.result);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error case here
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // get sale item overviw
  const getSalesItemSummaryOverviw = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/sales_item_summary?startDate=${dateFrom}&endDate=${dateTo}`
    )
      .then((res) => {
        setSalesItemSummaryOverview(res?.data?.result);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error case here
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Sale by Employee Get Employee Data
  const saleByEmployeeData = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/sale_employee?startDate=${dateFrom}&endDate=${dateTo}&search=${searchByEmployeeValue}`
    )
      .then((res) => {
        setSaleByEmployeData(res?.data);

        let employe = [];
        if (res?.data?.result.length > 0) {
          setSaleByEmploye(res?.data?.result);
          for (var x = 0; x < res?.data?.result?.length; x++) {
            let dataAry = Object.values(res?.data?.result[x]);
            employe.push(dataAry);
          }
          setSaleByEmployeTableData(employe);
          const headings = Object.keys(res?.data?.result[0]);
          setSaleByEmployeTableHeadings(headings);
        } else {
          setSaleByEmployeTableData([]);
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

  // payment method sales
  const SaleByPaymentMethods = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/sale_payment_method?startDate=${dateFrom}&endDate=${dateTo}`
    )
      .then((res) => {
        // setSaleByPaymentMethodTableBodyData(res?.data)

        // console.log("response of payment methods ", res?.data.paymentsBy);

        let methods = [];

        setPaymentMethods(res?.data?.paymentsBy);

        if (res?.data?.result.length > 0) {
          setSaleByPaymentMethod(res?.data?.result);
          for (var x = 0; x < res?.data?.result?.length; x++) {
            let dataAry = Object.values(res?.data?.result[x]);
            methods.push(dataAry);
          }
          setSaleByPaymentMethodTableBodyData(methods);
          const headings = Object.keys(res?.data?.result[0]);
          setSaleByPaymentMethodHeading(headings);
        } else {
          setSaleByPaymentMethodTableBodyData([]);
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

  // Sales Item Summary Data Fetch
  const getSalesItemSummary = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/sales_by_item?startDate=${dateFrom}&endDate=${dateTo}&search=${searchSaleByItem}`
    )
      .then((res) => {
        let lengthAry = res?.data?.result?.length
          ? res?.data?.result?.length
          : 0;
        let saleByIem = [];
        if (res?.data?.result?.length > 0) {
          setsaleByItem(res?.data?.result);
          setsaleByItemTableData(res?.data?.result);
        } else {
          setsaleByItemTableData([]);
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

  let inputsData = {
    startDate: dateFrom,
    endDate: dateTo,
    type: "by_paymentType",
  };
  // Sales by payment Method

  const [merchants, setMerchants] = useState([]);

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

  const [modals, setModals] = useState(null);

  useEffect(() => {
    if (user !== null && merchant !== null) {
      if (dateTo && dateFrom) {
        get_SaleByMerchantData();
        getSalesOverView();
        getSalesItemSummary();
        get_RushHour();
        saleByEmployeeData();
        dispatchTypeSell();
        getSaleByCategoryData();
        getSalesItemSummaryOverviw();
        SaleByPaymentMethods();

        getMerchantData();
        topCategories();
        getTopItems();
        get_RushHourCategoryGage();
        get_RushHourCategoryBar();
      }
    }
  }, [user, merchant, query]);

  // search by merchant
  useEffect(() => {
    if (user !== null && merchant !== null) {
      if (dateTo && dateFrom) {
        get_SaleByMerchantData();
      }
    }
  }, [user, merchant, query, searchMerchantValue]);

  // search by item
  useEffect(() => {
    if (user !== null && merchant !== null) {
      if (dateTo && dateFrom) {
        getSalesItemSummary();
      }
    }
  }, [user, merchant, query, searchSaleByItem]);

  // search by category
  useEffect(() => {
    if (user !== null && merchant !== null) {
      if (dateTo && dateFrom) {
        getSaleByCategoryData();
      }
    }
  }, [user, merchant, query, searchByCategoryValue]);

  // Sale By Employe
  useEffect(() => {
    if (user !== null && merchant !== null) {
      if (dateTo && dateFrom) {
        saleByEmployeeData();
      }
    }
  }, [user, merchant, query, searchByEmployeeValue]);

  // Search Top Categories
  useEffect(() => {
    if (user !== null && merchant !== null) {
      if (dateTo && dateFrom) {
        topCategories();
      }
    }
  }, [user, merchant, query, searchTopCategory]);

  // Search Top items
  useEffect(() => {
    if (user !== null && merchant !== null) {
      if (dateTo && dateFrom) {
        getTopItems();
      }
    }
  }, [user, merchant, query, searchTopItems]);

  useEffect(() => {
    if (user !== null && merchant !== null) {
      get_RushHour();
    }
  }, [user, merchant, query, searchRushHour]);

  useEffect(() => {
    if (user !== null && merchant !== null) {
      get_RushHourCategoryGage();
    }
  }, [user, merchant, query, searchTrendingCategories]);

  useEffect(() => {
    if (user !== null && merchant !== null) {
      get_RushHourCategoryBar();
    }
  }, [user, merchant, query]);

  const handleTab = (id) => {
    settopCategoreisProductsShow([]);
    let temp = tabs_heading.map((item) => {
      setTabStatus(id);
      if (item.id == id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
      return item;
    });
    setTabs(temp);
  };

  const handleChangeMerchant = (event) => {
    const merchant_id = event.target.value;
    getRequest(`/merchant/${merchant_id}`)
      .then((res) => {
        localStorage.removeItem("merchant");
        localStorage.setItem("merchant", JSON.stringify(res?.data));
        setMerchant(res?.data);
        // console.log("Your merchant has been switched!");
      })
      .catch((error) => {
        console.error("Error fetching merchant data:", error);
        // Handle the error (e.g., show a notification or error message)
      })
      .finally(() => {
        setLoading(false); // Ensure loading is set to false both after success and failure
      });
  };

  // export file in csv
  const exportToCSV = async (e) => {
    if (e === "export_merchant") {
      await csvDownloader(saleByMerchant, "merchants");
    }
    if (e === "export_dispatch") {
      await csvDownloader(saleBydispatch, "dispatch");
    }
    if (e === "sale_by_category") {
      if (saleByCategory.length > 0) {
        let categires = saleByCategory;
        categires.forEach((category, index) => {
          if (typeof category?.Name === "object") {
            category.Name = category.Name.name;
          }
        });
        await csvDownloader(categires, "Sale By Category");
      }
    }

    if (e === "sale_by_items") {
      await csvDownloader(saleByItem, "Sale By Items");
    }
    if (e === "sale_by_paymentMethod") {
      await csvDownloader(saleByPaymentMethod, "Sale By Payment Methods");
    }

    if (e === "sale_by_employee") {
      let employess = SaleByEmploye;
      employess.forEach((employe, index) => {
        if (typeof employe?.Employ === "object") {
          employe.Employ = employe.Employ.name;
        }
      });
      await csvDownloader(employess, "Sale By Employes");
    }

    if (e === "demanding_category") {
      let categires = topCategorislist;
      topCategorislist.forEach((category, index) => {
        if (typeof category?.Category === "object") {
          category.Category = category.Category.name;
        }
      });
      await csvDownloader(categires, "Top Categories");
    }

    if (e === "top_items") {
      let topList = topItemsList;
      topList.forEach((list, index) => {
        if (typeof list?.Name === "object") {
          list.Name = list.Name.name;
        }
      });
      await csvDownloader(topList, "Top Items");
    }

    if (e === "trending_categories") {
      let topCategoris = [];
      topCategoreis.forEach((category, index) => {
        delete category.items;
        topCategoris.push(category);
      });
      await csvDownloader(topCategoris, "Categories Peek Hours And Date");
    }

    if (e === "export_peek_hour_items") {
      await csvDownloader(
        topCategoreisProductsShow,
        "Peek Hourly Sale Items Category Wise"
      );
    }
  };

  const [perPage, setPerPage] = useState(10);
  const targetTableTopCategories = useRef(null);

  const [topCategoreisProductallData, settopCategoreisProductallData] =
    useState([]);
  const [topCategoreisProductsShow, settopCategoreisProductsShow] = useState(
    []
  );
  const [topCategoreisProductMeta, settopCategoreisProductMeta] = useState();

  const loadMoreBtn = (e) => {
    if (e === "loadMoreTopCategriesProduct") {
      if (
        topCategoreisProductMeta?.currentPage <
        topCategoreisProductMeta?.totalPages
      ) {
        let nextPage = topCategoreisProductMeta?.currentPage + 1;
        let result = loadMore(topCategoreisProductallData, nextPage, perPage);

        let meta = {
          totalPages: result?.totalPages,
          currentPage: result?.currentPage,
          hasMore: result?.hasMore,
        };
        settopCategoreisProductMeta(meta);
        settopCategoreisProductsShow((prev) => {
          return [...prev, ...result?.items];
        });
      }
    }
  };

  const showTable = (id) => {
    setTimeout(() => {
      if (targetTableTopCategories.current) {
        targetTableTopCategories.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 300);
    // topCategoreisProducts
    let data = topCategoreisProducts[id];

    settopCategoreisProductallData(data);
    const result = loadMore(data, 1, perPage);

    let meta = {
      totalPages: result?.totalPages,
      currentPage: result?.currentPage,
      hasMore: result?.hasMore,
    };
    settopCategoreisProductMeta(meta);
    settopCategoreisProductsShow(result?.items);
  };

  return (
    <div className="min-h-screen flex  bg-[#171821] relative">
      <SideMenu />
      <ReportModals
        dateTo={dateTo}
        dateFrom={dateFrom}
        setModals={setModals}
        modals={modals}
      />
      <div className=" w-[100%] xl:pl-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6 text-black bg-[#171821]">
        <div className=" px-4 md:px-10 rounded-lg py-12 bg-gray-50 w-[100%] h-[calc(100vh-48px)] overflow-y-auto">
          <div className="flex">
            <p className="text-[28px] md:text-[33px]">Sales Overview</p>
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
                <div className="flex border-b border-gray-400 mt-5">
                  <Tabs action={handleTab} tabs_heading={tabs_heading} />
                </div>

                {/* tab 1 */}
                {tab_status == 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 p-4">
                      <div className="px-3 mt-3 bg-[white] py-5 outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex items-center justify-center flex-col">
                        <span className="font-bold">GROSS TOTAL</span>
                        <span>
                          {" "}
                          {saleSummaryData?.total
                            ? saleSummaryData?.total
                            : 0.0}
                        </span>
                      </div>

                      <div className="px-3 mt-3 bg-[white] py-5 outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex items-center justify-center flex-col">
                        <span className="font-bold">NET AMOUNT</span>
                        <span>
                          {" "}
                          {saleSummaryData?.net_amount
                            ? saleSummaryData?.net_amount
                            : 0.0}
                        </span>
                      </div>
                    </div>

                    <div className="text-white text-center p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between">
                      <span className="flex items-center">
                        Sales By Merchant
                      </span>

                      <div className="flex justify-end">
                        {/* <input className="border p-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black" placeholder="Search..." value={searchMerchantValue} onChange={(e) => {
                          setSearchMerchantValue(e.target.value)
                        }}></input> */}

                        <select
                          id="sort-by"
                          name="sort-by"
                          className="px-4 py-3  border outline-none rounded-lg bg-white text-black ml-2"
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

                    {/* table for Sell by Store */}

                    <Table
                      tableBody={saleByMerchantTableBody}
                      tableHeading={saleByMerchantTableHeading}
                    />

                    {/* sale by dispatch */}
                    <div className="text-white text-center p-4 mt-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between">
                      <span className="flex items-center">
                        Sales By Dispatch Type
                      </span>

                      <div className="flex justify-center items-center ml-2">
                        <button
                          title="Export in CSV"
                          onClick={() => {
                            exportToCSV("export_dispatch");
                          }}
                        >
                          <FaFileExport className="text-[20px]" />
                        </button>
                      </div>
                    </div>
                    {/* export_dispatch */}
                    {/* table for Sell by Store */}

                    <Table
                      tableLink={true}
                      type="product"
                      byquery={true}
                      query={`datefrom=${dateFrom}&dateto=${dateTo}`}
                      tableBody={saleBydispatchType}
                      tableHeading={saleBydispatchTypeHeading}
                    />
                  </>
                ) : (
                  ""
                )}

                {/* tab 2 */}
                {tab_status == 1 ? (
                  <>
                    {/* tab for sale item summary */}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
                      <div className="px-3 mt-3 bg-[white] py-5 outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex items-center justify-center flex-col">
                        <span className="font-bold ">TOTAL Sold</span>
                        <span>
                          {saleItemSummaryOverview?.quantity
                            ? saleItemSummaryOverview?.quantity
                            : 0}
                        </span>
                      </div>

                      <div className="px-3 mt-3 bg-[white] py-5  outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex items-center justify-center flex-col">
                        <span className="font-bold">GROSS TOTAL</span>
                        <span>
                          {saleItemSummaryOverview?.GrossTotal
                            ? saleItemSummaryOverview?.GrossTotal
                            : 0}
                        </span>
                      </div>
                      <div className="px-3 mt-3 bg-[white] py-5 outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex items-center justify-center flex-col">
                        <span className="font-bold">NET AMOUNT</span>
                        <span>
                          {saleItemSummaryOverview?.NetAmount
                            ? saleItemSummaryOverview?.NetAmount
                            : 0}
                        </span>
                      </div>
                    </div>

                    <div className="text-white text-center p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between">
                      <span className="flex items-center">
                        Sales By Categories
                      </span>

                      <div className="flex">
                        <input
                          className="border p-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black"
                          placeholder="Search..."
                          value={searchByCategoryValue}
                          onChange={(e) => {
                            setsearchByCategoryValue(e.target.value);
                          }}
                        ></input>

                        <div className="flex justify-center items-center ml-2">
                          <button
                            title="Export in CSV"
                            onClick={() => {
                              exportToCSV("sale_by_category");
                            }}
                          >
                            <FaFileExport className="text-[20px]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <Table
                      tableLink={true}
                      type="product"
                      by_id={true}
                      byquery={true}
                      query={`datefrom=${dateFrom}&dateto=${dateTo}&category_id=true`}
                      tableBody={saleByCategoryTableBody}
                      tableHeading={saleByCategoryTableHeading}
                    />

                    {/* sale By item */}
                    <div className="text-white text-center p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between mt-5">
                      <span className="flex items-center">Sales By Items</span>

                      <div className="flex">
                        <input
                          className="border p-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black"
                          placeholder="Search..."
                          value={searchSaleByItem}
                          onChange={(e) => {
                            setsearchSaleByItem(e.target.value);
                          }}
                        ></input>

                        <div className="flex justify-center items-center ml-2">
                          <button
                            title="Export in CSV"
                            onClick={() => {
                              exportToCSV("sale_by_items");
                            }}
                          >
                            <FaFileExport className="text-[20px]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* sales by items table start here */}
                    <div className="relative overflow-x-auto overflow-y-hidden">
                      <table className="w-full border text-left">
                        <thead>
                          <tr className="bg-[#055938] text-[#fff] ">
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Name
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              GrossTotal
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Quantity
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Refunded Items
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Wasted
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Canceled
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Served{" "}
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Preparaing{" "}
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Ready{" "}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {saleByItemTableData.map((item, index) => {
                            return (
                              <tr
                                key={index}
                                className="border-b bg-white text-[14px]"
                              >
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  <Link
                                    href={`/reports/product/${item?.name.replace(
                                      / /g,
                                      "-"
                                    )}?datefrom=${dateFrom}&dateto=${dateTo}&product=true&exact=true`}
                                  >
                                    {item?.name}
                                  </Link>
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.GrossTotal}
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.Quantity}
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.RefundedItems}
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.Wasted}
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.Canceled}
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.Served}
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.Preparaing}
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.Ready}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Sales by item table end here */}

                    {/* tab for sale item summary end */}
                  </>
                ) : (
                  ""
                )}
                {/* tab 2 */}
                {tab_status == 2 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
                      {paymentMethods?.map((item, index) => {
                        return (
                          <div
                            key={index + 1}
                            className="px-3 mt-3 bg-[white] py-5 outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex items-center justify-center flex-col"
                          >
                            <span className="font-bold uppercase">
                              {item?.method}
                            </span>
                            <span>
                              {item?.gross_total ? item?.gross_total : 0}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-white text-center p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between mt-5">
                      <span className="flex items-center">Payment Methods</span>

                      <div>
                        <div className="flex justify-center items-center ml-2">
                          <button
                            title="Export in CSV"
                            onClick={() => {
                              exportToCSV("sale_by_paymentMethod");
                            }}
                          >
                            <FaFileExport className="text-[20px]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* <Table tableBody={saleByCategoryTableBody} tableHeading={["Categotry Name", "Quantity"]}/> */}
                    <Table
                      tableLink={true}
                      type="product"
                      byquery={true}
                      query={`datefrom=${dateFrom}&dateto=${dateTo}&payment_method=true`}
                      tableBody={saleByPaymentMethodTableBodyData}
                      tableHeading={saleByPaymentMethodHeading}
                    />

                    {/* tab for sale item summary end */}
                  </>
                ) : (
                  ""
                )}
                {/* tab 2 */}
                {tab_status == 3 ? (
                  <>
                    {/* tab three Started */}

                    {/* Sale by employee started */}
                    {/* SaleByEmployeData */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
                      <div className="px-3 mt-3 bg-[white] py-5 outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex items-center justify-center flex-col">
                        <span className="font-bold">TOTAL EMPLOYEES</span>
                        <span>
                          {SaleByEmployeData?.total_employes
                            ? SaleByEmployeData?.total_employes
                            : 0}
                        </span>
                      </div>
                    </div>

                    <div className="text-white text-center p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between mt-5">
                      <span className="flex items-center">
                        Sale By Employee
                      </span>

                      {/* sale by employ search */}
                      <div className="flex">
                        <input
                          className="border p-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black"
                          placeholder="Search..."
                          value={searchByEmployeeValue}
                          onChange={(e) => {
                            setsearchByEmployeeValue(e.target.value);
                          }}
                        ></input>

                        <div className="flex justify-center items-center ml-2">
                          <button
                            title="Export in CSV"
                            onClick={() => {
                              exportToCSV("sale_by_employee");
                            }}
                          >
                            <FaFileExport className="text-[20px]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* <Table tableBody={saleByCategoryTableBody} tableHeading={["Categotry Name", "Quantity"]}/> */}
                    <Table
                      tableLink={true}
                      type="product"
                      by_id={true}
                      byquery={true}
                      query={`datefrom=${dateFrom}&dateto=${dateTo}&employe_id=true`}
                      tableBody={SaleByEmployeTableData}
                      tableHeading={SaleByEmployeTableHeading}
                    />
                    {/* tab for sale item summary end */}

                    {/* Sale by employe ended */}

                    {/* tab three Ends */}
                  </>
                ) : (
                  ""
                )}
                {/* tab 2 */}
                {tab_status == 4 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
                      <div className="px-3 mt-3 bg-[white] py-5 outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex items-center justify-center flex-col">
                        <span className="font-bold">GROSS TOTAL</span>
                        <span>
                          {topSaleSummary?.gross_total
                            ? topSaleSummary?.gross_total
                            : "0.00"}
                        </span>
                      </div>
                    </div>

                    <div className="text-white text-center p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between mt-5">
                      <span className="flex items-center">
                        Categories Peek Hours And Date
                      </span>
                    </div>

                    {/* Top 5 Categories */}
                    {/* <HorizontalBarGraph data={topCategoreisBar} /> */}

                    {/* <div className="text-white text-center p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between mt-5">
                      <div className="flex ml-auto">
                        <input
                          className="border p-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black"
                          placeholder="Search..."
                          value={searchTrendingCategoriesBar}
                          onChange={(e) => {
                            setSearchTrendingCategoriesBar(e.target.value);
                          }}
                        ></input>

                        <div className="flex justify-center items-center ml-2">
                          <button
                            title="Export in CSV"
                            onClick={() => {
                              exportToCSV("trending_categories");
                            }}
                          >
                            <FaFileExport className="text-[20px]" />
                          </button>
                        </div>
                      </div>
                    </div> */}
                    {/* top categories Table start */}
                    <div className="relative overflow-x-auto overflow-y-hidden">
                      <table className="w-full border text-left">
                        <thead>
                          <tr className="bg-[#055938] text-[#fff] ">
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Category
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Gross Amount
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Quantity
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Time
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {topCategoreis.map((item, index) => {
                            return (
                              <tr
                                key={index}
                                className="border-b bg-white text-[14px]"
                              >
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  <span
                                    className="cursor-pointer"
                                    onClick={() => {
                                      showTable(index);
                                    }}
                                  >
                                    {item?.category}
                                  </span>
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.gross_amount}
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.quantity}
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.time}
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.date}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {topCategoreisProductsShow?.length > 0 ? (
                      <>
                        <div
                          ref={targetTableTopCategories}
                          className="text-white text-center p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between mt-5"
                        >
                          <span className="flex items-center">
                            {topCategoreisProductsShow[0]?.category_name}
                          </span>

                          <div className="flex">
                            <input
                              className="border p-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black"
                              placeholder="Search..."
                              onChange={(e) => {
                                // setSearchPeekHourItemsCategoryWise(e.target.value)
                                let value = e.target.value;
                                let Items_array = topCategoreisProductsShow;
                                let data = Items_array.filter((items) =>
                                  items.name
                                    .toLowerCase()
                                    .includes(value.toLowerCase())
                                );

                                if (value.length < 3) {
                                  settopCategoreisProductsShow(
                                    topCategoreisProductallData
                                  );
                                  setnoDataFoundMsg(null);
                                } else {
                                  if (data.length == 0) {
                                    // noDataFoundMsg
                                    setnoDataFoundMsg("No Data Found");
                                  } else {
                                    setnoDataFoundMsg(null);
                                    settopCategoreisProductsShow(data);
                                  }
                                }
                              }}
                            ></input>

                            <div className="flex justify-center items-center ml-2">
                              <button
                                title="Export in CSV"
                                onClick={() => {
                                  exportToCSV("export_peek_hour_items");
                                }}
                              >
                                <FaFileExport className="text-[20px]" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="relative overflow-x-auto overflow-y-hidden">
                          <table className="w-full border text-left">
                            <thead>
                              <tr className="bg-[#055938] text-[#fff] ">
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Name
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Gross Amount
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Category Name
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Quantity
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Date
                                </th>
                                <th className="px-7 py-3 text-[16px] font-semibold ">
                                  Time
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {noDataFoundMsg == null ? (
                                <>
                                  {topCategoreisProductsShow.map(
                                    (item, index) => {
                                      return (
                                        <tr
                                          key={index}
                                          className="border-b bg-white text-[14px]"
                                        >
                                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                            <Link
                                              href={`/reports/product/${item?.name.replace(
                                                / /g,
                                                "-"
                                              )}?datefrom=${dateFrom}&dateto=${dateTo}&product=true&exact=true`}
                                            >
                                              {item?.name}
                                            </Link>
                                          </td>
                                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                            {item?.gorss_amount}
                                          </td>
                                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                            {item?.category_name}
                                          </td>
                                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                            {item?.quantity}
                                          </td>
                                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                            {item?.date}
                                          </td>
                                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                            {item?.time}
                                          </td>
                                        </tr>
                                      );
                                    }
                                  )}
                                </>
                              ) : (
                                <>
                                  <tr>
                                    <td colSpan={6} className="text-center">
                                      {noDataFoundMsg}
                                    </td>
                                  </tr>
                                </>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {topCategoreisProductMeta?.currentPage >=
                        topCategoreisProductMeta?.totalPages ? (
                          <></>
                        ) : (
                          <>
                            <div className="my-[20px] flex justify-center">
                              <button
                                onClick={() => {
                                  loadMoreBtn("loadMoreTopCategriesProduct");
                                }}
                                className="cursor-pointer px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                              >
                                Load More
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <></>
                    )}

                    {/* tab for sale item summary end */}
                    <div className="text-white text-center p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between mt-5">
                      <span className="flex items-center">Top Categories</span>

                      {/* sale by employ search */}
                      <div className="flex">
                        <input
                          className="border p-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black"
                          placeholder="Search..."
                          value={searchTopCategory}
                          onChange={(e) => {
                            setsearchTopCategory(e.target.value);
                          }}
                        ></input>

                        <div className="flex justify-center items-center ml-2">
                          <button
                            title="Export in CSV"
                            onClick={() => {
                              exportToCSV("demanding_category");
                            }}
                          >
                            <FaFileExport className="text-[20px]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* <Table tableBody={saleByCategoryTableBody} tableHeading={["Categotry Name", "Quantity"]}/> */}
                    <Table
                      tableLink={true}
                      type="product"
                      name="top sells"
                      by_id={true}
                      byquery={true}
                      query={`datefrom=${dateFrom}&dateto=${dateTo}&category_id=true`}
                      tableBody={topCategorisTableBody}
                      tableHeading={topCategorisTableHeading}
                    />
                    {/* tab for sale item summary end */}

                    <div className="text-white text-center p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between mt-5">
                      <span className="flex items-center">Top Items</span>

                      {/* sale by employ search */}
                      <div className="flex">
                        <input
                          className="border p-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black"
                          placeholder="Search..."
                          value={searchTopItems}
                          onChange={(e) => {
                            setsearchTopItems(e.target.value);
                          }}
                        ></input>

                        <div className="flex justify-center items-center ml-2">
                          <button
                            title="Export in CSV"
                            onClick={() => {
                              exportToCSV("top_items");
                            }}
                          >
                            <FaFileExport className="text-[20px]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-x-auto overflow-y-hidden">
                      <table className="w-full border text-left">
                        <thead>
                          <tr className="bg-[#055938] text-[#fff] ">
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Name
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Gross Amount
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Category Name
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Quantity
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {topItemsList.map((item, index) => {
                            return (
                              <tr
                                key={index}
                                className="border-b bg-white text-[14px]"
                              >
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  <Link
                                    href={`/reports/product/${item?.name.replace(
                                      / /g,
                                      "-"
                                    )}?datefrom=${dateFrom}&dateto=${dateTo}&product=true&exact=true`}
                                  >
                                    {item?.name}
                                  </Link>
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.goross_amout}
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.category}
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.quantity}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* tab for sale item summary end */}
                  </>
                ) : (
                  ""
                )}
                {/* tabs end */}
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
