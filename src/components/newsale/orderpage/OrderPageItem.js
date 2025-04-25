import CSpinner from "@/components/common/CSpinner";
import { GlobalContext } from "@/context";
import { getRequest } from "@/utils/apiFunctions";
import { order_status, paid_status } from "@/utils/constants";
import { useContext, useEffect, useRef, useState } from "react";
import { AiOutlineShop } from "react-icons/ai";
import moment from "moment";

const LoadingSkeleton = () => {
  return (
    <>
      {[...new Array(5)].map((p, index) => (
        <div key={index} className="animate-pulse my-2">
          <div
            // key={index}
            className={`border-b bg-gray-200 border-gray-200 space-y-9 py-2 px-3 cursor-pointer w-[100%] h-[90px]`}
          >
            <div className="text-[13px] justify-between font-medium">
              <p className="w-[70px] h-[20px] bg-gray-100 rounded-sm"></p>
              <p className="w-[40px] h-[20px] bg-gray-100 rounded-sm mt-[10px]"></p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default function OrderPageItem({
  setFilter,
  filter,
  selectedOrderId,
  setSelectedOrderId,
  modals,
  searchFilters,
  triggerGetData,
  setTriggerGetData,
  isVisible,
  setIsVisible,
}) {
  const { user, merchant } = useContext(GlobalContext);

  let lastOrderDate = null;

  const [data, setData] = useState([]);

  const [pageCurrent, setPageCurrent] = useState(1);
  const [metaData, setMetaData] = useState();
  const initalRender = useRef(false);
  const [loading, setLoading] = useState(true);

  const getData = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/order?page=${pageCurrent}&filter=${filter}`,
      { searchFilters }
    )
      .then((res) => {
        if (pageCurrent == 1) {
          setData(res?.data?.data);
          setMetaData(res?.data?.meta);
        } else {
          setData((prevData) => {
            return [...prevData, ...res?.data?.data];
          });
          setMetaData(res?.data?.meta);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
        setTriggerGetData(false);
      });
  };

  useEffect(() => {
    if (triggerGetData == true) {
      getData();
    }
  }, [triggerGetData]);

  useEffect(() => {
    setPageCurrent(1);
    if (user !== null && filter !== null && merchant !== null) getData();
  }, [user, filter, modals, merchant]);

  useEffect(() => {
    if (initalRender.current) {
      getData();
    } else {
      initalRender.current = true;
    }
  }, [pageCurrent]);

  const handleLoadMore = () => {
    if (pageCurrent >= metaData?.last_page) {
      setPageCurrent(pageCurrent);
      return;
    }
    setPageCurrent(pageCurrent + 1);
  };

  const checkIfDate = (order) => {
    const orderTimestamp = Date.parse(order?.created_at);
    const orderDate = new Date(orderTimestamp).toLocaleDateString();

    if (lastOrderDate !== orderDate) {
      lastOrderDate = orderDate;
      return true;
    } else {
      return false;
    }
  };
  const ifCurrentDateisToday = (order) => {
    const orderDate = moment(order?.created_at);
    const currentDate = moment();

    if (orderDate.isSame(currentDate, "day")) {
      return true;
    } else {
      return false;
    }
  };

  const getOrderStatusText = (order) => {
    return order.order_status === order_status?.pending ||
      order.order_status === order_status?.preparing ||
      order.order_status === order_status?.ready ||
      order.order_status === order_status?.confirmed
      ? "In-progress"
      : order.order_status === order_status?.completed &&
        order.paid_status !== paid_status?.refunded
      ? "Paid"
      : order.order_status === order_status?.completed &&
        order.paid_status === paid_status?.refunded
      ? "Refunded"
      : order.order_status === order_status?.voided
      ? "Voided"
      : order.order_status === order_status?.cancelled &&
        order.paid_status === paid_status?.refunded
      ? "Refunded"
      : "Cancelled";
  };

  const getBorderColor = (order) => {
    if (
      order.order_status === order_status?.pending ||
      order.order_status === order_status?.preparing ||
      order.order_status === order_status?.ready ||
      order.order_status === order_status?.confirmed
    ) {
      return "border-[#F7B507]";
    } else if (
      order.order_status === order_status?.completed &&
      order.paid_status !== paid_status?.refunded
    ) {
      return "border-[#0B6038]";
    } else if (
      (order.order_status === order_status?.completed &&
        order.paid_status === paid_status?.refunded) ||
      (order.order_status === order_status?.cancelled &&
        order.paid_status === paid_status?.refunded)
    ) {
      return "border-blue-500";
    } else if (order.order_status === order_status?.voided) {
      return "border-gray-500";
    } else {
      return "border-red-500";
    }
  };

  const getSelectedTextColor = (order) => {
    if (
      order.order_status === order_status?.pending ||
      order.order_status === order_status?.preparing ||
      order.order_status === order_status?.ready ||
      order.order_status === order_status?.confirmed
    ) {
      return "text-[#F7B507]";
    } else if (
      order.order_status === order_status?.completed &&
      order.paid_status !== paid_status?.refunded
    ) {
      return "text-[#0B6038]";
    } else if (
      (order.order_status === order_status?.completed &&
        order.paid_status === paid_status?.refunded) ||
      (order.order_status === order_status?.cancelled &&
        order.paid_status === paid_status?.refunded)
    ) {
      return "text-blue-500";
    } else if (order.order_status === order_status?.voided) {
      return "text-gray-500";
    } else {
      return "text-red-500";
    }
  };
  const getSelectedBgColor = (order) => {
    if (
      order.order_status === order_status?.pending ||
      order.order_status === order_status?.preparing ||
      order.order_status === order_status?.ready ||
      order.order_status === order_status?.confirmed
    ) {
      return "bg-yellow-50";
    } else if (
      order.order_status === order_status?.completed &&
      order.paid_status !== paid_status?.refunded
    ) {
      return "bg-[#F2FCED]";
    } else if (
      (order.order_status === order_status?.completed &&
        order.paid_status === paid_status?.refunded) ||
      (order.order_status === order_status?.cancelled &&
        order.paid_status === paid_status?.refunded)
    ) {
      return "bg-blue-100";
    } else if (order.order_status === order_status?.voided) {
      return "bg-gray-100";
    } else {
      return "bg-red-50";
    }
  };

  return (
    <>
      {data && data?.length > 0 ? (
        <>
          {data.map((order, index) => {
            const totalCost = order?.net_amount ?? 0;
            return (
              <div key={index} className="">
                {checkIfDate(order) === true && (
                  <div className="bg-[#F8F8F8] text-[#8F8F8F] justify-center flex flex-col flex-grow h-[30px] w-[100%] px-[16px] text-[12px]">
                    <p>
                      {ifCurrentDateisToday(order) == true
                        ? "Today"
                        : moment(order?.created_at).format("MMMM DD, YYYY")}
                    </p>
                  </div>
                )}
                <button
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order);
                    setIsVisible(false);
                  }}
                  className={`space-y-[5px] py-3 px-3 cursor-pointer w-[100%] border-l-2 ${
                    selectedOrderId?.id === order.id
                      ? `${getSelectedTextColor(order)} ${getSelectedBgColor(
                          order
                        )}`
                      : "hover:bg-gray-50 text-[#8F8F8F]"
                  } ${getBorderColor(order)} my-2`} // Added mx-2 and my-2 for margin
                >
                  <div className="lg:text-[18px] md:text-[14px] text-[12px] flex justify-between font-medium">
                    <p>Order ID: #{order?.id}</p>
                    <p>
                      {merchant?.currency?.symbol ?? <>&euro;</>}
                      {totalCost}
                    </p>
                  </div>

                  {order?.table && (
                    <div className="flex justify-between lg:text-[14px] text-[12px] font-medium">
                      <p>Table No: #{order?.table?.number}</p>
                    </div>
                  )}

                  <div className="flex justify-between lg:text-[14px] text-[12px]">
                    <p className="flex items-center space-x-2">
                      <AiOutlineShop />
                      <span>{getOrderStatusText(order)}</span>
                    </p>
                    <p>{moment(order?.created_at).format("LT")}</p>
                  </div>
                </button>
              </div>
            );
          })}

          {pageCurrent >= metaData?.last_page ? (
            <></>
          ) : (
            <>
              <div className="my-3 flex justify-center">
                <button
                  onClick={() => {
                    handleLoadMore();
                  }}
                  className="font-light bg-gradient-to-r from-[#7DE143] to-[#055938] text-white hover:underline cursor-pointer px-3 py-1"
                >
                  Load More
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center h-[100%]">
          <p className="">No Record Found!</p>
        </div>
      )}
      {loading && <LoadingSkeleton />}
    </>
  );
}
