"use client";

import CSpinner from "@/components/common/CSpinner";
import SideMenu from "@/components/menus/SideMenu";
import Paginate from "@/components/paginate";
import NoData from "@/components/reporting/no-data";
import CustomDateRangePicker from "@/components/ui/custom-date-range-picker";
import { GlobalContext } from "@/context";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { order_type_text, paid_by_text } from "@/utils/constants";
import { BiSolidArchiveIn } from "react-icons/bi";
import {
  FILTERS,
  debounce,
  formatToMySQLDate,
  getErrorMessageFromResponse,
} from "@/utils/helper";
import moment from "moment";
import { useSearchParams } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { Table } from "rsuite";
import "rsuite/Table/styles/index.css";
import format from "date-fns/format";
import { FaSearch } from "react-icons/fa";
import CustomTimeRangePicker from "@/components/ui/custom-time-range-picker";
import axios from "axios";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { MdArrowLeft } from "react-icons/md";
import Swal from "sweetalert2";
const { Column, HeaderCell, Cell } = Table;

function ReportData() {
  const searchParams = useSearchParams();
  const { merchant } = useContext(GlobalContext);

  const [inputs, setInputs] = useState({
    dateFrom: null,
    dateTo: null,
    filter: null,
    filterValue: null,
  });

  const [dateRange, setDateRange] = useState(null);
  const [pageName, setPageName] = useState(null);
  const [backPageName, setBackPageName] = useState(null);

  const [data, setData] = useState(null);

  const [pageCurrent, setPageCurrent] = useState(1);
  const [metaData, setMetaData] = useState();

  const [loading, setLoading] = useState(false);

  const handleDateRangeChange = (range) => {
    if (range && range.length > 0) {
      const fromDate = new Date(range[0]);
      const toDate = new Date(range[1]);
      const formattedFromDate = formatToMySQLDate(fromDate);
      const formattedToDate = formatToMySQLDate(toDate);
      setDateRange([formattedFromDate, formattedToDate]);
      setInputs({
        ...inputs,
        dateFrom: formattedFromDate,
        dateTo: formattedToDate,
      });
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
    let url = `/merchant/${merchant?.id}/get/orders/data?page=${pageCurrent}&filter=${inputs.filter}&filter_value=${inputs.filterValue}&dateFrom=${inputs?.dateFrom}&dateTo=${inputs?.dateTo}`;
    if (timeRange?.timeStart && timeRange?.timeEnd) {
      url = url.concat(
        `&timeStart=${timeRange?.timeStart}&timeEnd=${timeRange?.timeEnd}`
      );
    }
    getRequest(url)
      .then((res) => {
        const filteredData = res?.data?.data.filter(
          (item) => item.status !== "archived"
        );
        setData(filteredData);
        setMetaData(res?.data?.meta);
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSearchButton = () => {
    if (merchant?.id && dateRange) {
      getData();
    }
  };

  const getDataDelay = useCallback(debounce(getData, 800), [
    inputs,
    merchant,
    dateRange,
    pageCurrent,
  ]);
  useEffect(() => {
    if (merchant?.id !== undefined) {
      const getFilter = searchParams.get("filter") || null;
      const getFilterValue = searchParams.get("filter_value") || null;
      const getDateFrom =
        searchParams.get("dateFrom") || formatToMySQLDate(new Date());
      const getDateTo =
        searchParams.get("dateTo") || formatToMySQLDate(new Date());
      const getPageName = searchParams.get("pageName") || "Order Data";
      const getBackPageName =
        searchParams.get("backPageName") || FILTERS.sales_report;

      setInputs({
        dateFrom: getDateFrom,
        dateTo: getDateTo,
        filter: getFilter,
        filterValue: getFilterValue,
      });
      setPageName(getPageName);
      setBackPageName(getBackPageName);
      setDateRange([
        formatToMySQLDate(new Date(getDateFrom)),
        formatToMySQLDate(new Date(getDateTo)),
      ]);
    }
  }, [merchant, searchParams]);

  useEffect(() => {
    if (inputs.dateFrom && inputs.dateTo) {
      setLoading(true);
      getDataDelay();
    }
  }, [inputs, pageName, backPageName, dateRange, getDataDelay, pageCurrent]);

  const contentwithSymbol = (content) => {
    const number = parseFloat(content || 0);
    return `${merchant?.currency?.symbol ?? <>&euro;</>}${number.toFixed(2)}`;
  };

  const CurrencyCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
      {rowData[dataKey]
        ? `${contentwithSymbol(rowData[dataKey])}`
        : rowData[dataKey]}
    </Cell>
  );

  const OrderDateTime = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
      {rowData[dataKey]
        ? `${moment(rowData[dataKey]).format("LT, MMM DD, YYYY")}`
        : rowData[dataKey]}
    </Cell>
  );

  const OrderType = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
      {rowData[dataKey]
        ? `${order_type_text[rowData[dataKey]]}`
        : rowData[dataKey]}
    </Cell>
  );

  const PaidBy = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
      {rowData[dataKey]
        ? `${paid_by_text[rowData[dataKey]]}`
        : rowData[dataKey]}
    </Cell>
  );

  const CustomerName = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
      {rowData[dataKey] ? `${rowData[dataKey]?.fullname}` : "--"}
    </Cell>
  );

  const DiscountName = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
      {rowData[dataKey] ? `${rowData[dataKey]?.discount_name}` : "--"}
    </Cell>
  );

  const EmployeeName = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
      {rowData[dataKey] ? `${rowData[dataKey]?.name}` : "--"}
    </Cell>
  );

  const [selectedRows, setSelectedRows] = useState([]);

  const handleCheckboxChange = (id) => {
    setSelectedRows((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((itemId) => itemId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleSelectAllChange = (event) => {
    if (event.target.checked) {
      setSelectedRows(data?.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const isAllSelected = data?.every((row) => selectedRows.includes(row.id));

  const handleArchived = () => {
    if (selectedRows.length > 0) {
      const method = "put";

      let url = `/merchant/${merchant?.id}/addtoarchive`;

      postRequest(
        url,
        {
          ids: selectedRows,
        },
        method
      )
        .then((res) => {
          setShowAreYouSure(false);
          setSelectedRows([]);
          Swal.fire({
            text: "Successfully Archived",
            icon: "success",
          });
          getData();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const [showSelect, setShowSelect] = useState(false);
  const [showAreYouSure, setShowAreYouSure] = useState(false);

  const AreYouSure = ({}) => {
    return (
      <>
        {showAreYouSure && (
          <div className="fixed z-[99] top-0 left-0 right-0 bottom-0 flex justify-center items-center">
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-[#00000053]"></div>
            <div className="relative z-[999] w-[90%] px-3 sm:w-[70%] md:w-[40%] bg-white py-12 flex flex-col gap-5 items-center justify-center rounded-lg">
              <p className="font-semibold text-center">
                Are You Sure You want to manage this item?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowAreYouSure(false)}
                  className="border text-[14px] sm:text-[16px] px-3 sm:px-5 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchived}
                  className="border text-[14px] sm:text-[16px] px-3 sm:px-5 py-2 rounded-md bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <AreYouSure />
      <div className="min-h-screen flex bg-[#171821] gap-x-[18px] relative">
        <SideMenu />
        <div className="w-[100%] xl:pl-0 xl:w-[80%] overflow-y-auto px-5 xl:px-0 xl:pr-5 py-6 h-screen text-black bg-[#171821]">
          <div className="px-4 md:px-10 rounded-lg py-12 bg-gray-50 h-[calc(100vh-48px)] overflow-y-auto w-[100%]">
            <div className="flex">
              <p className="text-[28px] md:text-[33px]">
                Order Data {pageName == "Order Data" ? "" : "by " + pageName}
              </p>
            </div>
            <div className="mt-[20px] flex flex-col sm:flex-row gap-[10px] sm:gap-[20px] sm:items-center w-full">
              <CustomDateRangePicker onChange={handleDateRangeChange} />
              <CustomTimeRangePicker onChange={handleTimeRangeChange} />
              <div className="flex justify-center items-center w-fit">
                <button
                  className="pt-2 pb-2 pl-4 pr-4 bg-gradient-to-r from-[#13AAE0] to-[#18D89D] font-bold rounded-lg text-white text-center"
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
              {loading == true ? (
                <div className="min-h-[200px] w-full justify-center items-center flex">
                  <CSpinner color="text-black !w-[50px] !h-[50px]" />
                </div>
              ) : data?.length > 0 ? (
                <>
                  <h2 className="mb-[10px]">
                    {moment(dateRange[0]).format("MMM D, YYYY") +
                      "-" +
                      moment(dateRange[1]).format("MMM D, YYYY")}
                  </h2>
                  <Table autoHeight data={data} onRowClick={(rowData) => {}}>
                    <Column width={120}>
                      <HeaderCell>Order ID#</HeaderCell>
                      <Cell dataKey="id" />
                    </Column>
                    <Column width={150}>
                      <HeaderCell>Customer</HeaderCell>
                      <CustomerName dataKey="customer" />
                    </Column>
                    <Column width={150}>
                      <HeaderCell>Employee</HeaderCell>
                      <EmployeeName dataKey="employee" />
                    </Column>
                    <Column width={150}>
                      <HeaderCell>Discount</HeaderCell>
                      <DiscountName dataKey="discount" />
                    </Column>
                    <Column width={200}>
                      <HeaderCell>Gross Amount</HeaderCell>
                      <CurrencyCell dataKey="gross_total" />
                    </Column>
                    <Column width={200}>
                      <HeaderCell>Reason</HeaderCell>
                      <Cell
                        dataKey="foc_reason"
                        style={{
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      />
                    </Column>
                    <Column width={200}>
                      <HeaderCell>Net Amount</HeaderCell>
                      <CurrencyCell dataKey="net_amount" />
                    </Column>
                    <Column width={200}>
                      <HeaderCell>Payment Type</HeaderCell>
                      <PaidBy className="capitalize" dataKey="paid_by" />
                    </Column>
                    <Column width={200}>
                      <HeaderCell>Order Type</HeaderCell>
                      <OrderType className="capitalize" dataKey="order_type" />
                    </Column>
                    <Column width={350}>
                      <HeaderCell>Order Datetime</HeaderCell>
                      <OrderDateTime dataKey="created_at" />
                    </Column>
                    <Column width={40}>
                      <HeaderCell>
                        <button
                          onClick={() => setShowSelect(!showSelect)}
                          className="w-[20px] hover:bg-[#f1f5ff]"
                        >
                          <MdArrowLeft
                            className={`text-[20px] ${
                              showSelect ? "" : "rotate-180"
                            }`}
                            color="red"
                          />
                        </button>
                      </HeaderCell>
                      <Cell></Cell>
                    </Column>
                    {showSelect && (
                      <Column width={selectedRows.length > 0 ? 70 : 40}>
                        <HeaderCell>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isAllSelected}
                              onChange={handleSelectAllChange}
                            />
                            {selectedRows.length > 0 && (
                              <button
                                onClick={() => {
                                  setShowAreYouSure(true);
                                }}
                                className="text-[16px]"
                              >
                                <BiSolidArchiveIn />
                              </button>
                            )}
                          </div>
                        </HeaderCell>
                        <Cell>
                          {(rowData) => (
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(rowData.id)}
                              onChange={() => handleCheckboxChange(rowData.id)}
                            />
                          )}
                        </Cell>
                      </Column>
                    )}
                  </Table>
                  {metaData && metaData?.total > 0 ? (
                    <Paginate
                      metaData={metaData}
                      setPageCurrent={setPageCurrent}
                    />
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <NoData>
                  <h2 className="font-[500] text-[16px]">
                    No Orders in This Time Frame
                  </h2>
                  <p className="text-[12px]">
                    No orders took place during the time frame you selected.
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

export default ReportData;
