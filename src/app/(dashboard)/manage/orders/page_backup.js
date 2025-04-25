"use client";
import { calculateTotalCostOfOrder } from "@/utils/calculationFunctions";
import { useEffect, useRef, useState } from "react";
import { debounce } from "@/utils/helper";
import { AiOutlineSearch } from "react-icons/ai";
import ProtectedRoute from "@/components/protected-route";
import SideMenu from "@/components/menus/SideMenu";
import OrderPageItem from "@/components/newsale/orderpage/OrderPageItem";
import OrderDetailItem from "@/components/newsale/orderpage/OrderDetailItem";
export default function Orders() {
  const [filter, setFilter] = useState("date.new");
  const [selectedOrderId, setSelectedOrderId] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    order_id: "",
    customer_info: "",
    order_status: "",
  });
  const [triggerGetData, setTriggerGetData] = useState(false);
  const onHandleSearchFilter = (e) => {
    e?.preventDefault();
    setTriggerGetData(true); // Toggle the state to trigger effect in child
  };
  const dbn = debounce(onHandleSearchFilter, 800);
  const [isVisible, setIsVisible] = useState(true);

  const toggleDiv = () => {
    setIsVisible(!isVisible);
  };
  const [isExpanded, setIsExpanded] = useState(true);
  const inputRef = useRef(null);

  // Function to close input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputRef]);
  return (
    <ProtectedRoute pageName={"orders"}>
      <div className="min-h-screen flex bg-[#171821]">
        <SideMenu />
        <div className="w-[100%] xl:ml-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6 h-screen overflow-auto text-black bg-[#171821]">
          <div className="w-[100%] h-[calc(100vh-48px)] overflow-y-auto bg-[#F8F8F8] rounded-[20px]  py-10 lg:p-10 px-3 md:px-8 lg:pr-16">
            <div className="sm:pl-6 w-[100%]">
              <div className="flex items-center justify-between sm:py-2 w-[100%] border-b-2 border-[#E0E7EB]">
                <div className="text-[22px] sm:block hidden">Orders</div>
                <div className="flex items-center justify-end space-x-3 w-full">
                  <form
                    // onSubmit={onHandleSearchFilter}
                    className="px-1 md:px-5"
                  >
                    <div
                      className="sm:bg-transparent bg-transparent sm:border w-auto border-[#f5f5f5e5] rounded-xl flex items-center space-x-2 md:px-2 sm:px-1 sm:py-0 px-2 py-2 md:mt-[0px]"
                      ref={inputRef}
                    >
                      <AiOutlineSearch
                        className="sm:text-[#565A61] text-[#2F353E] text-[24px] cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                      />
                      <input
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d+$/.test(value)) {
                            setSearchFilters({
                              order_id: value,
                              customer_info: "",
                              order_status: "",
                            });
                          } else if (/\S+@\S+\.\S+/.test(value)) {
                            setSearchFilters({
                              order_id: "",
                              customer_info: value,
                              order_status: "",
                            });
                          } else {
                            setSearchFilters({
                              order_id: "",
                              customer_info: "",
                              order_status: value,
                            });
                          }
                          onHandleSearchFilter(e);
                        }}
                        type="search"
                        placeholder="Search..."
                        className={`sm:py-3 py-0.5 outline-none bg-transparent sm:text-[#565A61] text-[#2F353E] sm:w-full ${
                          isExpanded ? "block" : "block"
                        }`}
                        autoFocus={isExpanded}
                      />
                    </div>
                  </form>
                </div>
              </div>
              <div className="w-[100%] bg-[white] text-[#3d4c66] flex overflow-hidden relative h-full">
                <div
                  className={`max-sm:w-[100%] ${
                    selectedOrderId && "max-sm:hidden"
                  } w-[35%] border-r-2 border-[#E0E7EB]`}
                >
                  <div className="py-2 border-b border-gray-200 flex lg:space-x-6 space-x-2 outline-none items-center lg:text-[14px] text-[12px] w-[100%] h-[58.2px] px-2">
                    <div className="flex whitespace-nowrap lg:text-[20px] text-[14px]">
                      Sort by:
                    </div>
                    <select
                      onChange={(e) => setFilter(e.target.value)}
                      defaultValue={filter}
                      className="border border-[#D9D9D9] outline-[#D9D9D9] text-[#545353] w-[70%] h-10 sm:px-[8px] px-[2px] lg:px-3 rounded-[5px] ml-[5px] lg:ml-2 py-2"
                    >
                      <option value="date.new">Date (Newest)</option>
                      <option value="date.old">Date (Oldest)</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="h-[calc(100vh-190px)] overflow-y-auto pb-7 relative bg-[#fff] px-2 sm:px-0">
                    <OrderPageItem
                      searchFilters={searchFilters}
                      setSelectedOrderId={setSelectedOrderId}
                      selectedOrderId={selectedOrderId}
                      filter={filter}
                      setFilter={setFilter}
                      calculateTotalCostOfOrder={calculateTotalCostOfOrder}
                      triggerGetData={triggerGetData}
                      setTriggerGetData={setTriggerGetData}
                      isVisible={isVisible}
                      setIsVisible={setIsVisible}
                    />
                  </div>
                </div>

                {/*  */}
                <div
                  className={`max-sm:w-[100%] sm:h-[calc(100vh-135px)] h-[calc(100vh-50px)] overflow-y-auto ${
                    selectedOrderId ? "block" : "max-sm:hidden"
                  } w-[65%]`}
                >
                  <OrderDetailItem
                    setSelectedOrderId={setSelectedOrderId}
                    selectedOrderId={selectedOrderId}
                    filter={filter}
                    setFilter={setFilter}
                    calculateTotalCostOfOrder={calculateTotalCostOfOrder}
                    isVisible={isVisible}
                    setIsVisible={setIsVisible}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
