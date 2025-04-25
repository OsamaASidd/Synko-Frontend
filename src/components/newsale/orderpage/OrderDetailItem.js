import { GlobalContext } from "@/context";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import {
  order_item_status,
  order_item_status_text,
  order_status,
  order_type,
  order_type_text,
  paid_status,
  text_type,
} from "@/utils/constants";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import PrintSlip from "../PrintSlip";
import {
  calcAmount,
  calculatePriceWithTax,
  getErrorMessageFromResponse,
  getTotalProductCost,
} from "@/utils/helper";
import Swal from "sweetalert2";
import { BiEditAlt } from "react-icons/bi";
import { MdOutlineArrowBack } from "react-icons/md";
import Refunded from "../modals/Refunded";
import { useDispatch } from "react-redux";

export default function OrderDetailItem({
  selectedOrderId,
  setSelectedOrderId,
  setModals,
  setSelectedTable,
  setOrderType,
  setOrderProduct,
  setServiceCharges,
  setDeliveryCharges,
  setCustomer,
}) {
  const { user, merchant } = useContext(GlobalContext);

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const [printData, setPrintData] = useState(null);

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/orders/${selectedOrderId?.id}`)
      .then((res) => {
        setData(res?.data);
        setPrintData(res?.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedOrderId && merchant && user) getData();
  }, [selectedOrderId]);
  const buttonDisable = (data) => {
    if (
      data?.order_status == order_status.completed ||
      data?.order_status == order_status.cancelled ||
      data?.order_status == order_status.voided
    ) {
      return true;
    } else {
      false;
    }
  };

  function update_order_status(status, emplyid) {
    let input = {
      order_status: status,
      employe_id: emplyid,
    };
    postRequest(`/merchant/${merchant.id}/change_status/${data.id}`, input)
      .then(async (res) => {
        console.log("res", res);
        if (res.status == 200) {
          setData(res?.data.data);
          Swal.fire({
            text: "Order has been cancelled!",
            icon: "success",
          });
        }
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  }

  const totalCost = +data?.net_amount ?? 0;
  const gross_amount = +data?.gross_total ?? 0;
  const discount = +data?.discount?.discount;

  const deliveryCharges = +data?.deliveryCharges?.charges || 0;
  const service_charges = +data?.service_charges || 0;

  const { discountAmount } = calcAmount(
    data?.discount,
    data?.tax,
    gross_amount
  );
  const { tax } = calculatePriceWithTax(
    data,
    gross_amount,
    discountAmount,
    null,
    service_charges,
    deliveryCharges
  );
  const formattedDate = (dateString) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };
  const [isRefundedModalOpen, setIsRefundedModalOpen] = useState(false);
  const model_ids = { refunded: "refunded" }; // Ensure this is defined
  const paid_by = {
    0: "none",
    1: "cash",
    2: "card",
    3: "credits",
    4: "foc",
  };
  const dispatch = useDispatch();

  return (
    <>
      {loading == true ? (
        <></>
      ) : (
        <>
          {data?.id ? (
            <>
              <button
                onClick={() => setSelectedOrderId(null)} // Reset selectedOrderId to hide this view
                className="flex items-center space-x-2 text-md font-semibold text-[#000] px-4 py-2 rounded-md sm:hidden"
              >
                <span>
                  <MdOutlineArrowBack fontSize={20} />
                </span>
                <span>Back</span>
              </button>
              <div className="sm:px-4 px-2 py-3 w-[100%]">
                <div className="flex justify-between flex-col sm:h-[calc(100vh-160px)] h-[calc(100vh-120px)]">
                  <div className="sm:h-[calc(100%-180px)] overflow-y-auto">
                    {" "}
                    <div
                      className={`
                  ${
                    data.order_status === order_status.pending ||
                    data.order_status === order_status.preparaing
                      ? "bg-yellow-50" // yellow for pending or preparing
                      : data.order_status === order_status.completed
                      ? "bg-[#F2FCED]" // green for completed
                      : data.order_status === order_status.cancelled
                      ? "bg-red-50" // red for cancelled
                      : data.order_status === order_status.refunded
                      ? "bg-blue-100" // red for cancelled
                      : "bg-[#e9f5fd]"
                  } // default background color
                  font-semibold p-3 space-y-2`}
                    >
                      <div className="flex justify-between items-center text-[15px]">
                        <div className="flex items-center space-x-2 lg:text-[22px] text-[#000]">
                          <p>Order: #{data?.id}</p>
                        </div>
                        {isRefundedModalOpen && (
                          <Refunded
                            setModals={setIsRefundedModalOpen} // Pass the setter to the modal
                            modals={
                              isRefundedModalOpen ? model_ids.refunded : null
                            } // Conditional rendering based on modal state
                            setOrderType={setOrderType}
                            model_ids={model_ids} // Ensure this is passed
                            order_id={data?.id}
                            setOrderProduct={data}
                            // setOrderProduct={setOrderProduct}
                          />
                        )}
                        <button
                          onClick={() => {
                            // setIsRefundedModalOpen(true);
                          }}
                          className="lg:text-[18px] text-[#0C6138] flex items-center space-x-1"
                        >
                          <p className="">
                            {data.order_status === order_status?.pending ||
                            data.order_status === order_status?.preparaing ||
                            data.order_status === order_status?.ready ||
                            data.order_status === order_status?.confirmed
                              ? "Pending"
                              : data.order_status === order_status?.completed &&
                                data.paid_status !== paid_status.refunded
                              ? "Completed"
                              : data.order_status === order_status.completed &&
                                data.paid_status === paid_status.refunded
                              ? "Refunded"
                              : data.order_status === order_status.cancelled &&
                                data.paid_status === paid_status.refunded
                              ? "Refunded"
                              : "Cancelled"}
                          </p>
                          <p>
                            <BiEditAlt fontSize={20} />
                          </p>
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-[15px]">
                        {data?.employee?.name && (
                          <div className="flex justify-between items-center text-[15px]">
                            <div className="lg:text-[16px] text-[14px] text-[#8F8F8F]">
                              Taken By: {data?.employee?.name}
                            </div>
                          </div>
                        )}
                        <div className="lg:text-[16px] text-[14px] text-[#8F8F8F]">
                          {order_type_text[data?.order_type]}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-[#8F8F8F]">
                          Payment: {paid_by[data.paid_by] || "Unknown"}
                        </div>
                        <div className="lg:text-[16px] text-[14px] text-[#000]">
                          <span>Total:</span>{" "}
                          <span className="lg:text-[22px] font-semibold">
                            {merchant?.currency?.symbol ?? <>&euro;</>}
                            {totalCost}
                          </span>
                        </div>
                      </div>
                    </div>
                    {data.customer == null ? (
                      <></>
                    ) : (
                      <div className="flex justify-between py-2 px-4 border-b">
                        <div className="space-y-1">
                          <div className="lg:text-[22px] text-[#000]">
                            {data?.customer.fullname}
                          </div>
                          <div className="lg:text-[16px] text-[12px] text-[#8F8F8F]">
                            {data?.customer.email}
                          </div>
                          <div className="lg:text-[16px] text-[12px] text-[#8F8F8F]">
                            {data?.customer.phone}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <h1 className="text-[#000] lg:text-[22px] font-semibold py-4 px-1">
                        Order Details
                      </h1>
                      <div className="lg:text-[16px] text-[13px] text-[#73787D]">
                        {data?.order_date ? formattedDate(data.order_date) : ""}
                      </div>
                    </div>
                    <div className=" overflow-y-auto h-[300px]">
                      {/* Display order items for the selected order */}
                      <ul>
                        {data?.order_items && data?.order_items.length > 0 ? (
                          <>
                            {data?.order_items.map((item) => (
                              <li
                                className="flex justify-between text-[12px] py-4 p-2  border-b"
                                key={item.id}
                              >
                                <div className="space-y-5">
                                  <div className="flex space-x-2">
                                    <div className="w-5 h-5 text-[16px] flex items-center justify-center font-semibold text-[#fff] bg-gradient-to-r from-[#7DE143] to-[#055938]">
                                      {item.quantity}
                                    </div>
                                    <div className="flex flex-col">
                                      <p className="font-semibold">
                                        <p className="lg:text-[18px] text-[#000]">
                                          {item.name} &nbsp;{" "}
                                          <span>({item.quantity})</span>
                                        </p>
                                        {item?.status ==
                                        order_item_status.canceled ? (
                                          <span className="text-[red]">
                                            {
                                              order_item_status_text[
                                                item?.status
                                              ]
                                            }
                                          </span>
                                        ) : item?.status ==
                                          order_item_status.wasted ? (
                                          <span className="text-[red]">
                                            {
                                              order_item_status_text[
                                                item?.status
                                              ]
                                            }
                                          </span>
                                        ) : item?.status ==
                                          order_item_status.refunded ? (
                                          <span className="text-[red]">
                                            {
                                              order_item_status_text[
                                                item?.status
                                              ]
                                            }
                                          </span>
                                        ) : null}
                                      </p>
                                      {item?.modifications &&
                                      item?.modifications?.length > 0 ? (
                                        <>
                                          {item.modifications.map((modi) => (
                                            <div key={modi.id}>
                                              <p className="text-[#73787D] font-semibold text-[10px] lg:text-[13px]">
                                                {modi?.modificationOption.name}{" "}
                                                {modi?.modificationOption
                                                  ?.modification_category
                                                  ?.is_custom_text
                                                  ? modi?.custom_text
                                                  : null}
                                                {modi?.modificationOption
                                                  ?.modification_category
                                                  ?.is_custom_text
                                                  ? modi?.modificationOption
                                                      ?.modification_category
                                                      ?.text_type ==
                                                    text_type.percentage
                                                    ? "%"
                                                    : null
                                                  : null}{" "}
                                                {modi?.modificationOption
                                                  ?.modification_category
                                                  ?.is_excluded == true ? (
                                                  <span className="text-[#EE3050]">
                                                    (Exclude)
                                                  </span>
                                                ) : (
                                                  <span className="text-[#055938]">
                                                    (Add)
                                                  </span>
                                                )}
                                              </p>
                                            </div>
                                          ))}
                                        </>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <p>
                                  {item.stat || ""}
                                  <span className="font-semibold">
                                    {item?.status ==
                                      order_item_status.canceled ||
                                    item?.status == order_item_status.wasted ? (
                                      <></>
                                    ) : (
                                      <div className="lg:text-[18px] text-[14px] text-[#000]">
                                        <span>Price:</span>
                                        <span>
                                          {merchant?.currency?.symbol ?? (
                                            <>&euro;</>
                                          )}
                                          {getTotalProductCost(item)}
                                        </span>
                                      </div>
                                    )}
                                  </span>
                                </p>
                              </li>
                            ))}
                          </>
                        ) : (
                          <>
                            <p className="text-[#3d4c66] p-4">
                              No items found!
                            </p>
                          </>
                        )}
                      </ul>
                      {/* Calculate and display the total amount */}
                    </div>
                  </div>
                  <div>
                    <div className="flex  justify-end p-4 text-[#73787D]">
                      <div className="w-[60%]  space-y-3">
                        <div className="flex lg:text-[16px] text-[12px] justify-between border-t border-gray-300">
                          <p> Sub-Total </p>
                          <p>
                            {merchant?.currency?.symbol ?? <>&euro;</>}
                            {gross_amount}
                          </p>
                        </div>

                        {data?.discount && (
                          <div className="flex lg:text-[16px] text-[12px] justify-between ">
                            <p>
                              Discount{" "}
                              {data?.discount?.discount_type == "by_percentage"
                                ? "(" + data?.discount?.discount + "%)" || 0
                                : ""}
                              :
                            </p>
                            <p className="font-semibold">
                              -{merchant?.currency?.symbol ?? <>&euro;</>}
                              {discountAmount.toFixed(2)}
                            </p>
                          </div>
                        )}

                        {data?.service_charges ? (
                          <div className="flex lg:text-[16px] text-[12px] justify-between ">
                            <p>Service Charges:</p>
                            <p className="font-semibold">
                              {merchant?.currency?.symbol ?? <>&euro;</>}
                              {data?.service_charges}
                            </p>
                          </div>
                        ) : (
                          ""
                        )}

                        {deliveryCharges ? (
                          <div className="flex text-[15px] justify-between ">
                            <p>Delivery Charges </p>
                            <p className="font-semibold">
                              {merchant?.currency?.symbol ?? <>&euro;</>}
                              {deliveryCharges.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          ""
                        )}

                        {data?.tax && (
                          <div className="flex lg:text-[16px] text-[12px] justify-between ">
                            <p>Total Tax ({data?.tax?.tax ?? 0}%)</p>
                            <p className="font-semibold">
                              {merchant?.currency?.symbol ?? <>&euro;</>}
                              {/* {((tax.toFixed(2)/100)*gross_amount).toFixed(2)} */}

                              {tax?.toFixed(2) || 0}
                            </p>
                          </div>
                        )}

                        <div className="flex lg:text-[16px] text-[12px]  justify-between">
                          <p className="font-semibold">Total</p>
                          <p className="font-semibold">
                            {merchant?.currency?.symbol ?? <>&euro;</>}
                            {totalCost}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex text-white font-semibold text-[14px] px-2 space-x-4 border-t border-gray-400 pt-2 ">
                      <button
                        onClick={() => {
                          handlePrint();
                        }}
                        className="px-4 py-3 w-[100%] lg:text-[16px] text-[12px] whitespace-nowrap border  bg-[#fff] text-[#8F8F8F] font-bold border-[#8F8F8F] rounded-md"
                      >
                        Receipt
                      </button>

                      <button
                        onClick={() => {
                          data?.order_status == order_status.cancelled ||
                          data?.paid_status == paid_status.refunded ||
                          data?.paid_status == paid_status.paid ||
                          data?.order_status == order_status.completed
                            ? null
                            : update_order_status(order_status.cancelled);
                        }}
                        className={`px-4 py-3 w-[100%] ${
                          data?.order_status == order_status.cancelled ||
                          data?.paid_status == paid_status.refunded ||
                          data?.paid_status == paid_status.paid ||
                          data?.order_status == order_status.completed
                            ? "bg-slate-400"
                            : "bg-gradient-to-r from-[#7DE143] to-[#055938]"
                        } text-white font-bold border-[#055938] rounded-md whitespace-nowrap lg:text-[16px] text-[12px]`}
                      >
                        Cancel Order
                      </button>
                    </div>
                  </div>
                </div>

                <div className="hidden">
                  <PrintSlip data={{ order: printData }} ref={componentRef} />
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-[#3d4c66] p-4 flex justify-center text-center items-center h-[100%]">
                Select an order to view its items
              </p>
            </>
          )}
        </>
      )}
    </>
  );
}
