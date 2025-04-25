"use client";
import React, { useContext, useEffect, useRef } from "react";
import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { GlobalContext } from "@/context";
import SideMenu from "@/components/menus/SideMenu";
import { getRequest, postRequest, postRequestpos } from "@/utils/apiFunctions";
import { PulseLoader } from "react-spinners";
import Modal from "@/components/modal";
import CSpinner from "@/components/common/CSpinner";
import { AiOutlineClose } from "react-icons/ai";
import SingleOrderModal from "./modal";
import OrderDetails from "./OrderDetails";
import CustomDateRangePicker from "@/components/ui/custom-date-range-picker";
import { formatToMySQLDate, getErrorMessageFromResponse } from "@/utils/helper";
import {
  order_status,
  order_status_text,
  order_type,
  order_type_text,
  paid_by_text,
  paid_status,
  paid_status_text,
} from "@/utils/constants";
import moment from "moment";
import ProtectedRoute from "@/components/protected-route";
import Paginate from "@/components/paginate";

import { IconButton, Table } from "rsuite";
import "rsuite/Table/styles/index.css";
import Popover from "rsuite/Popover";
import "rsuite/Popover/styles/index.css";
import Dropdown from "rsuite/Dropdown";
import Whisper from "rsuite/Whisper";
import "rsuite/Dropdown/styles/index.css";
import { IoIosMore } from "react-icons/io";
import { createPortal } from "react-dom";
import Refunded from "./refunded";
import Refund from "./refund";
import Swal from "sweetalert2";

const { Column, HeaderCell, Cell } = Table;

export default function Orders() {
  const router = useRouter();
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);

  const [data, setData] = useState([]);

  // const [selectedOrderId, setelectedOrderId] = useState();

  const [pageCurrent, setPageCurrent] = useState(1);
  const [metaData, setMetaData] = useState();
  const initalRender = useRef(false);

  const [loading, setLoading] = useState(false);

  const [searchbyid, setsearchbyid] = useState("");

  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpenRefunded, setIsOpenRefunded] = useState(null);
  const [dateRange, setDateRange] = useState(["", ""]);

  const [openAction, setOpenAction] = useState(null);
  const [trigger, setTrigger] = useState(false);
  const dropdownRef = useRef(null);

  const setIsOpenAction = (id) => {
    setOpenAction(openAction === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenAction(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDateRangeChange = (range) => {
    if (range && range.length > 0) {
      const fromDate = new Date(range[0]);
      const toDate = new Date(range[1]);

      const formattedFromDate = formatToMySQLDate(fromDate);
      const formattedToDate = formatToMySQLDate(toDate);

      setDateRange([formattedFromDate, formattedToDate]);
    }
  };

  const toggleModal = () => {
    setIsOpen2(!isOpen2);
  };
  const toggleModalRefunded = (id) => {
    getRequest(`/merchant/${merchant?.id}/order/${id}`).then((res) => {
      setIsOpenRefunded(res?.data);
      // setIsOpenRefunded(isOpenRefunded?.id === id ? null : id);
    });
  };

  useEffect(() => {
    if (trigger == true) {
      getData();
      setTrigger(false);
    }
  }, [trigger]);

  const getData = () => {
    getRequest(
      `/merchant/${merchant?.id}/order?page=${pageCurrent}&searchbyid=${searchbyid}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}`
    )
      .then((res) => {
        setData(res?.data?.data);
        setMetaData(res?.data?.meta);
        setIsDataUpdated(false);
      })
      .finally(() => {
        setPageLevelLoader(false);
      });
  };

  console.warn(data, "===================>>>>res?.data?.data");

  const [singleData, setSingleData] = useState();

  const getSingleOrderData = (Id) => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/order/${Id}`).then((res) => {
      console.log(res?.data, "<-------res?.data?.data");
      setSingleData(res?.data);
      setIsOpen2(true);
    });
  };

  useEffect(() => {
    if (merchant.id !== undefined && user) getData();
  }, [user, merchant, searchbyid, dateRange]);

  useEffect(() => {
    if (initalRender.current) {
      getData();
    } else {
      initalRender.current = true;
    }
  }, [pageCurrent]);

  const [dataUpdated, setIsDataUpdated] = useState(null);
  useEffect(() => {
    if (dataUpdated == true) {
      getData();
    }
  }, [dataUpdated, dateRange]);

  //cancel order api
  function update_order_status(id, status) {
    console.log("cancel order id=>", id);
    console.log("cancel order status=>", status);
    let input = {
      order_status: status,
      // employe_id: emplyid,
    };
    postRequest(`/merchant/${merchant.id}/change_status/${id}`, input)
      .then(async (res) => {
        if (res.status == 200) {
          setData(res?.data.data);
          setTrigger(true);
          Swal.fire({
            text: "Order has been cancelled!",
            icon: "success",
          });
        }
      })
      .catch((err) => getErrorMessageFromResponse(err.message))
      .finally(() => {
        setLoading(false);
      });
  }

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
  const OrderStatus = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
      {rowData[dataKey]
        ? `${order_status_text[rowData[dataKey]]}`
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

  const renderMenu = ({ onClose, left, top, className }, ref) => {
    const handleSelect = (eventKey) => {
      onClose();

      console.log(eventKey);
    };
    return (
      <Popover ref={ref} className={className} style={{ left, top }} full>
        <Dropdown.Menu onSelect={handleSelect}>
          <Dropdown.Item eventKey={1}>Preview</Dropdown.Item>
        </Dropdown.Menu>
      </Popover>
    );
  };
  const ActionCell = ({ rowData, dataKey, ...props }) => {
    return (
      <Cell {...props} className="link-group mb-[5px]">
        <Whisper
          placement="autoVerticalStart"
          trigger="click"
          speaker={renderMenu}
        >
          <IconButton appearance="subtle" icon={<IoIosMore />} />
        </Whisper>
      </Cell>
    );
  };
  const DropdownPortal = ({ children }) => {
    return createPortal(children, document.body);
  };

  if (pageLevelLoader) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <PulseLoader
          color={"white"}
          loading={pageLevelLoader}
          size={30}
          data-testid="loader"
        />
      </div>
    );
  }
  return (
    <ProtectedRoute pageName={"orders"}>
      <div className="min-h-screen flex bg-[#171821]">
        <SideMenu />
        {/* <OrderDetails /> */}
        <div className="w-[100%] xl:ml-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6 h-screen overflow-auto text-black bg-[#171821]">
          <div className="w-[100%] h-[calc(100vh-48px)] overflow-y-auto bg-[#F8F8F8] rounded-[20px]  py-10 lg:p-10 px-3 md:px-8 lg:pr-16">
            <div className="w-[100%] border-b-2 text-[24px] py">Orders</div>
            <div className="w-[100%] flex justify-between py-5 items-center">
              <input
                onChange={(event) => {
                  setsearchbyid(event.target.value);
                }}
                className="border p-3 sm:p-4 placeholder:text-[14px] sm:placeholder:text-[16px] w-full sm:w-[60%] md:w-[45%] rounded-[15px] bg-[#F8F8F8] outline-none"
                placeholder="Search Order ID"
              />
            </div>
            <div className="px-2 sm:px-4">
              <div className="mt-[10px] relative z-10">
                <CustomDateRangePicker onChange={handleDateRangeChange} />
              </div>
            </div>

            <div className="mt-[15px] relative">
              <Table autoHeight data={data} onRowClick={(rowData) => {}}>
                <Column width={120}>
                  <HeaderCell>Order ID#</HeaderCell>
                  <Cell dataKey="id" />
                </Column>
                <Column width={150}>
                  <HeaderCell>Employee</HeaderCell>
                  <EmployeeName dataKey="employee" />
                </Column>
                <Column width={200}>
                  <HeaderCell>Order Status</HeaderCell>
                  <OrderStatus className="capitalize" dataKey="order_status" />
                </Column>
                <Column width={200}>
                  <HeaderCell>Gross Amount</HeaderCell>
                  <CurrencyCell dataKey="gross_total" />
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
                <Column width={150}>
                  <HeaderCell>Discount</HeaderCell>
                  <DiscountName dataKey="discount" />
                </Column>
                <Column width={150}>
                  <HeaderCell>Customer</HeaderCell>
                  <CustomerName dataKey="customer" />
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
                <Column width={80}>
                  <HeaderCell>...</HeaderCell>

                  <Cell style={{ padding: "6px" }}>
                    {(rowData) => (
                      <button
                        appearance="link"
                        onClick={() => {
                          getSingleOrderData(rowData?.id);
                        }}
                      >
                        Preview
                      </button>
                    )}
                  </Cell>
                </Column>

                <Column width={160}>
                  <HeaderCell>Edit</HeaderCell>
                  <Cell
                    style={{ padding: "6px", position: "relative", zIndex: 10 }}
                  >
                    {(rowData) => (
                      <>
                        {/* Refund / Cancelled Button */}
                        {(rowData?.order_status === 7 ||
                          rowData?.order_status === 8) && (
                          <button
                            onClick={() => {
                              toggleModalRefunded(rowData?.id);
                            }}
                            className={`${
                              rowData?.order_status === 8
                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-[#7DE143] to-[#055938] text-[#fff] text-start"
                            } px-5 py-2 rounded-lg w-[120px] text-[13px] flex items-center justify-center`}
                            disabled={rowData?.order_status === 8}
                          >
                            {rowData?.order_status === 8
                              ? "Cancelled"
                              : "Refund"}
                          </button>
                        )}
                        {(rowData?.order_status === 1 ||
                          rowData?.order_status === 2 ||
                          rowData?.order_status === 3 ||
                          rowData?.order_status === 4 ||
                          rowData?.order_status === 5 ||
                          rowData?.order_status === 6) && (
                          <button
                            onClick={() => {
                              update_order_status(
                                rowData?.id,
                                order_status.cancelled
                              );
                            }}
                            className={`${
                              rowData?.order_status === 8
                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                : "bg-[#DDF1D1] text-[#055838] text-start"
                            } px-5 py-2 rounded-lg w-[120px] text-[13px] flex items-center justify-center`}
                            disabled={rowData?.order_status === 8}
                          >
                            {rowData?.order_status === 8
                              ? "Cancelled"
                              : "Cancel Order"}
                          </button>
                        )}
                        {rowData?.order_status === 9 && (
                          <button
                            className={`${
                              rowData?.order_status === 9
                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                : "bg-[#DDF1D1] text-[#055838] text-start"
                            } px-5 py-2 rounded-lg w-[120px] text-[13px] flex items-center justify-center`}
                            disabled={rowData?.order_status === 9}
                          >
                            Voided
                          </button>
                        )}

                        {/* Cancel Order Button */}
                        {/* {(rowData?.order_status === 1 ||
                          rowData?.order_status === 2 ||
                          rowData?.order_status === 3 ||
                          rowData?.order_status === 4 ||
                          rowData?.order_status === 5 ||
                          rowData?.order_status === 6 ||
                          rowData?.order_status === 9) && (
                          <button className="bg-[#DDF1D1] text-[#055938] text-start px-5 py-2 rounded-lg w-[120px] text-[13px] flex items-center justify-center">
                            Cancel Order
                          </button>
                        )} */}
                      </>
                    )}
                  </Cell>
                </Column>
              </Table>
              {metaData && metaData?.total > 0 ? (
                <Paginate metaData={metaData} setPageCurrent={setPageCurrent} />
              ) : (
                <></>
              )}
            </div>
            {/* <div className="relative overflow-x-auto min-h-screen h-full overflow-y-hidden">
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-[#055938] text-[#ffffff]">
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Order #
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Table #
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Order Type
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Order Date
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Payment Status
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Status
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data && data.length > 0 ? (
                    <>
                      {data?.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b bg-white text-[14px]"
                        >
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            #{item?.id}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.table?.number && "#"}{" "}
                            {item?.table?.number ?? "--"}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            <div className="bg-gray-100 text-gray-700 px-2 py-1 w-fit text-center rounded-[5px]">
                              {order_type_text[item?.order_type]}
                            </div>
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {moment(item?.created_at).format(
                              "MMMM DD, YYYY   LT"
                            )}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            <div className="bg-gray-100 text-gray-700 px-2 py-1 w-fit text-center rounded-[5px]">
                              {paid_status_text[item?.paid_status]}
                            </div>
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item.order_status == order_status?.pending ||
                            item.order_status == order_status?.preparaing ||
                            item.order_status == order_status?.preparaing ||
                            item.order_status == order_status?.ready ||
                            item.order_status == order_status?.confirmed ? (
                              <>
                                <div className="bg-blue-100 text-blue-500 px-2 py-1 w-fit text-center rounded-[5px]">
                                  Pending
                                </div>
                              </>
                            ) : (
                              <>
                                {item?.order_status ==
                                order_status?.cancelled ? (
                                  <>
                                    <div className="bg-red-100 text-red-500 px-2 py-1 w-fit text-center rounded-[5px]">
                                      {order_status_text[item?.order_status]}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="bg-green-100 text-green-500 px-2 py-1 w-fit text-center rounded-[5px]">
                                      Completed
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            <div className="p-4">
                              <div className="group relative">
                                <button>
                                  <BsThreeDots size={22} />
                                </button>
                                <nav
                                  tabIndex="0"
                                  className="border-2 bg-white invisible border-gray-800 rounded absolute right-5 -top-10 transition-all opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-1 z-10"
                                >
                                  <ul className="py-1">
                                    <li>
                                      <button
                                        onClick={() => {
                                          getSingleOrderData(item?.id);
                                        }}
                                        className=" block px-4 py-2 left-1 -top-15 hover:bg-gray-100 w-[100%]"
                                      >
                                        Preview
                                      </button>
                                    </li>
                                  </ul>
                                </nav>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : null}
                </tbody>
              </table>
              {metaData && metaData?.total > 0 ? (
                <Paginate metaData={metaData} setPageCurrent={setPageCurrent} />
              ) : (
                <></>
              )}
            </div> */}
          </div>
        </div>

        {/* <SideMenu /> */}
        {/* {console.log("singleData ", singleData)} */}
        <Refunded
          isOpen2={isOpenRefunded}
          setIsOpenRefunded={setIsOpenRefunded}
          toggleModal={toggleModalRefunded}
          contentComponent={
            <Refund
              isOpenRefunded={isOpenRefunded}
              setTrigger={setTrigger}
              setIsOpenRefunded={setIsOpenRefunded}
            />
          }
        />
        <SingleOrderModal
          isOpen2={isOpen2}
          toggleModal={toggleModal}
          contentComponent={<OrderDetails data={singleData} />}
        />
      </div>
    </ProtectedRoute>
  );
}
