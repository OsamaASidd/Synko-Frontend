"use client";

import CSpinner from "@/components/common/CSpinner";
import SideMenu from "@/components/menus/SideMenu";
import CategorySales from "@/components/sales/category-sales";
import Dashboard from "@/components/sales/dashboard";
import DiscountApplied from "@/components/sales/discount-applied";
import EmployeeSales from "@/components/sales/employee-sales";
import ItemSales from "@/components/sales/item-sales";
import PaymentMethods from "@/components/sales/payment-methods";
import RushHours from "@/components/sales/rush-hours";
import SalesSummary from "@/components/sales/sales-summary";
import CustomDateRangePicker from "@/components/ui/custom-date-range-picker";
import CustomTimeRangePicker from "@/components/ui/custom-time-range-picker";
import { GlobalContext } from "@/context";
import { getRequest } from "@/utils/apiFunctions";
import { REPORT_PAGES } from "@/utils/constants";
import {
  debounce,
  FILTERS,
  formatToMySQLDate,
  getErrorMessageFromResponse,
} from "@/utils/helper";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";

export default function Report() {
  const { merchant } = useContext(GlobalContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pageCurrent, setPageCurrent] = useState(1);
  const [metaData, setMetaData] = useState();
  const initalRender = useRef(false);
  const [currentReportPage, setCurrentReportPage] = useState(
    REPORT_PAGES.report
  );
  const [dateRange, setDateRange] = useState([
    formatToMySQLDate(new Date()),
    formatToMySQLDate(new Date()),
  ]);
  const [data, setData] = useState(null);
  const [otherData, setOtherData] = useState(null);
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
  const [timeRange, setTimeRange] = useState(null);
  const handleTimeRangeChange = (range) => {
    if (range && range.length === 2) {
      const [start, end] = range;
      const formattedStart = format(start, "HH:mm:ss");
      const formattedEnd = format(end, "HH:mm:ss");
      setTimeRange({ timeStart: formattedStart, timeEnd: formattedEnd });
      // if (onTimeRangeChange) {
      //   onTimeRangeChange({ start: formattedStart, end: formattedEnd });
      // }
    }
  };

  const getData = () => {
    let url;

    const baseUrl = `/merchant/${merchant?.id}/get`;
    const filtersMap = {
      [REPORT_PAGES.report]: `${baseUrl}_dashboard_sales?filter=${FILTERS.sales_report}`,
      [REPORT_PAGES.sales_summary]: `${baseUrl}/sales-summary?filter=${FILTERS.sales_report}`,
      [REPORT_PAGES.payment_methods]: `${baseUrl}/sales-summary?filter=${FILTERS.payment_methods}`,
      [REPORT_PAGES.item_sales]: `${baseUrl}/sales-summary?filter=${FILTERS.item_sales}&page=${pageCurrent}&isPaginate=true`,
      [REPORT_PAGES.category_sales]: `${baseUrl}/sales-summary?filter=${FILTERS.category_sales}&page=${pageCurrent}&isPaginate=true`,
      [REPORT_PAGES.employee_sales]: `${baseUrl}/sales-summary?filter=${FILTERS.employee_sales}`,
      [REPORT_PAGES.discount_sales]: `${baseUrl}/sales-summary?filter=${FILTERS.discount_applied}`,
      [REPORT_PAGES.rush_hours]: `${baseUrl}/rush-days?filter=${FILTERS.rush_hours}`,
    };

    url = filtersMap[currentReportPage];
    if (url) {
      url += `&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}`;
      if (timeRange?.timeStart && timeRange?.timeEnd) {
        url += `&timeStart=${timeRange.timeStart}&timeEnd=${timeRange.timeEnd}`;
      }
    }
    getRequest(url)
      .then((res) => {
        const data = res?.data;
        if (
          [REPORT_PAGES.item_sales, REPORT_PAGES.category_sales].includes(
            currentReportPage
          )
        ) {
          const { graphData, ...oData } = data;
          if (pageCurrent == 1) {
            setData(graphData?.data);
          } else {
            setData((prevData) => {
              return [...prevData, ...graphData?.data];
            });
          }
          setMetaData(graphData?.meta);
          setOtherData(oData);
        } else {
          setData(data || null);
        }
        setTimeRange(null);
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSearchButton = () => {
    if (merchant?.id && dateRange) {
      setLoading(true);
      getData();
    }
  };

  const gd = debounce(getData, 800);
  useEffect(() => {
    if (merchant?.id && dateRange) {
      setLoading(true);
      gd();
    }
  }, [currentReportPage, pageCurrent, dateRange, searchParams, timeRange]);

  const contentwithSymbol = (content) => {
    const number = parseFloat(content || 0);
    return `${merchant?.currency?.symbol ?? <>&euro;</>}${number.toFixed(2)}`;
  };

  const reportPagesArray = Object.entries(REPORT_PAGES).map(([key, value]) => ({
    key,
    value,
  }));

  const GetPage = (props) => {
    switch (currentReportPage) {
      case REPORT_PAGES.report:
        return <Dashboard {...props} />;
        break;
      case REPORT_PAGES.sales_summary:
        return <SalesSummary {...props} />;
        break;
      case REPORT_PAGES.payment_methods:
        return <PaymentMethods {...props} />;
        break;
      case REPORT_PAGES.item_sales:
        return <ItemSales {...props} />;
        break;
      case REPORT_PAGES.category_sales:
        return <CategorySales {...props} />;
        break;
      case REPORT_PAGES.employee_sales:
        return <EmployeeSales {...props} />;
        break;
      case REPORT_PAGES.discount_sales:
        return <DiscountApplied {...props} />;
        break;
      case REPORT_PAGES.rush_hours:
        return <RushHours {...props} />;
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const pageName = searchParams.get("pageName") || false;
    const startDate = searchParams.get("start") || false;
    const endDate = searchParams.get("end") || false;
    if (pageName !== false) {
      setCurrentReportPage(pageName);
      setDateRange([startDate, endDate]);
    }
  }, [searchParams]);

  return (
    <>
      <div className="min-h-screen flex bg-[#171821] relative">
        <SideMenu />
        <div className=" w-[100%] xl:pl-0 xl:w-[80%] overflow-y-auto px-5 xl:px-0 xl:pr-5 py-6 h-screen text-black bg-[#171821]">
          <div className="px-4 md:px-10 rounded-lg py-12 bg-gray-50 h-[calc(100vh-48px)] overflow-y-auto w-[100%]">
            <div className="flex">
              <p className="text-[28px] md:text-[33px] capitalize">
                {currentReportPage || "Reporting"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 mt-[10px] gap-[10px]">
              {reportPagesArray.map(({ key, value }) => {
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setCurrentReportPage(value);
                    }}
                    className={` ${
                      currentReportPage == value
                        ? "border-[#055938] text-[#055938] bg-[#DDF1D1]"
                        : ""
                    } py-[10px] px-[10px] bg-[#ffffff] border-2 rounded-[5px] text-[14px]`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <div className="mt-[20px] flex gap-x-[20px] items-center w-full">
              <CustomDateRangePicker onChange={handleDateRangeChange} />
              <CustomTimeRangePicker onChange={handleTimeRangeChange} />
              <div className="flex justify-center items-center">
                <button
                  className="pt-2 pb-2 pl-4 pr-4 bg-gradient-to-r from-[#7DE143] to-[#055938] font-bold rounded-lg text-white text-center"
                  onClick={() => {
                    handleSearchButton();
                  }}
                  disabled={loading}
                >
                  {loading == true ? (
                    <>
                      <CSpinner color="text-white" />
                    </>
                  ) : (
                    <FaSearch />
                  )}
                </button>
              </div>
            </div>
            <div className="mt-[30px]">
              {loading == true &&
              (currentReportPage !== REPORT_PAGES.item_sales ||
                currentReportPage !== REPORT_PAGES.category_sales) ? (
                <div className="min-h-[200px] w-full justify-center items-center flex">
                  <CSpinner color="text-black !w-[50px] !h-[50px]" />
                </div>
              ) : (
                <GetPage
                  merchant={merchant}
                  currentReportPage={currentReportPage}
                  setCurrentReportPage={setCurrentReportPage}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  data={data}
                  setData={setData}
                  loading={loading}
                  setLoading={setLoading}
                  contentwithSymbol={contentwithSymbol}
                  metaData={metaData}
                  setPageCurrent={setPageCurrent}
                  setOtherData={setOtherData}
                  otherData={otherData}
                  timeRange={timeRange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
