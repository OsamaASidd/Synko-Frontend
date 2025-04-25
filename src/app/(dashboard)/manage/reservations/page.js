"use client";
import { IoSearch } from "react-icons/io5";
import Link from "next/link";
import { GlobalContext } from "@/context";
import { useContext, useEffect, useState, useRef } from "react";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import dynamic from "next/dynamic";
import Modal from "@/components/modal";
import CSpinner from "@/components/common/CSpinner";
import Swal from "sweetalert2";
import { todayDate } from "@/utils/Dates";
import ProtectedRoute from "@/components/protected-route";
import SideMenu from "@/components/menus/SideMenu";
import { BsThreeDots } from "react-icons/bs";
import moment from "moment";
import { formatDatetime, getErrorMessageFromResponse } from "@/utils/helper";
import CreateCustomer from "../newsale/create-customer";
import Actions from "@/components/ui/action";
import useHandleInputs from "@/hooks/useHandleInputs";
import CustomKeyboard from "@/components/ui/custom-keyboard";
import useDeviceVisibility from "@/hooks/useDeviceVisibility";

export default function Reports() {
  const { merchant, user } = useContext(GlobalContext);
  const dataTest = useContext(GlobalContext);

  let dateNow = todayDate();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState("");
  const [start_from, setstart_from] = useState();
  const [dateTo, setDateTo] = useState("");
  const [start_time, setstart_time] = useState(dateNow);
  const [end_time, setend_time] = useState("");
  const [alert, setAlert] = useState({ type: "danger", message: "" });
  const [pageCurrent, setPageCurrent] = useState(1);
  const [metaData, setMetaData] = useState();
  const [selectedId, setSelectedId] = useState(0);
  const [filterStatus, setfilterStatus] = useState("all");
  const handleDateFromChange = (e) => {
    e.preventDefault();
    let newDateFrom = e.target.value;
    setDateFrom(newDateFrom);
    newDateFrom = newDateFrom.split("T");

    setstart_from(newDateFrom[0]);
  };

  function formatDate(dateString) {
    if (!dateString) return "";

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString("en-US", options);
  }

  const handleSubmitButton = () => {
    getData();
  };

  const getData = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/reservation?page=${pageCurrent}&start_from=${start_from}`
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
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const [modals, setModals] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [modelIsOpen, setIsOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);
  const initalRender = useRef(false);

  const [customer, setCustomer] = useState([]);
  useEffect(() => {
    if (user !== null && merchant !== null) {
      getData();
    }
  }, [user, merchant]);

  const initialState = {
    customer_id: null,
    customer_name: "",
    phone: "",
    num_of_people: 1,
    start_from: dateNow,
    end_at: end_time ? end_time : "",
  };

  const [inputs, handleInputs, setInputs] = useHandleInputs(initialState);

  const handleStartTime = (e) => {
    e.preventDefault();
    const newDateFrom = e.target.value;
    setstart_time(newDateFrom);
    inputs.start_from = newDateFrom;
    setInputs(inputs);
  };

  const handleModal = (data) => {
    setIsOpen(true);
    setCurrentModalData(data);
  };

  const handleSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
    if (inputs.customer_name == "" || inputs.customer_name == null) {
      setLoading(false);
      window.alert("Select Customer First");
    } else {
      postRequest(`/merchant/${merchant?.id}/reservation`, inputs)
        .then((res) => {
          setInputs(initialState);
          Swal.fire({
            text: res.data.message,
            icon: "success",
          });
          getData();
          event.target.reset();
          setIsOpen(false);
        })
        .catch((error) => {
          getErrorMessageFromResponse(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleReschedule = (e) => {
    e.preventDefault();
    if (currentModalData.reservation_id) {
      setLoading(true);
      let url = `/merchant/${merchant?.id}/rechedule_reservation/${currentModalData?.reservation_id}`;
      let input = {
        start_from: startDate,
      };
      let method = "put";
      postRequest(url, input, method)
        .then((res) => {
          getData();
          setIsOpen(false);
          Swal.fire({
            icon: "success",
            text: "Successfully Updated",
          });
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          // getErrorMessageFromResponse(error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      window.alert("Reservation Not Selected");
    }
  };
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

  useEffect(() => {
    if (customer) {
      console.log(customer, "<-----customer");
      setInputs({ customer_id: customer.id, customer_name: customer.fullname });
    }
  }, [customer]);

  console.log(inputs, "<------setInputs");

  const formatDateTimeForInput = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [startDate, setStartDate] = useState(() => {
    return formatDatetime(currentModalData?.selectedStartDate || new Date());
  });
  useEffect(() => {
    setStartDate(() => {
      return formatDatetime(currentModalData?.selectedStartDate || new Date());
    });
  }, [modelIsOpen]);

  const handleUpdateTime = (e) => {
    e.preventDefault();
    const newDateFrom = e.target.value;
    setStartDate(newDateFrom);
  };

  const handleStatus = (id, value) => {
    setLoading(true);
    let url = `/merchant/${merchant?.id}/reservation/${id}`;
    let input = {
      status: value,
    };
    let method = "put";
    postRequest(url, input, method)
      .then((res) => {
        getData();
        Swal.fire({
          icon: "success",
          text: "Successfully Updated",
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const actionArray = [
    { name: "Cancel", value: "cancel" },
    { name: "Booked", value: "booked" },
    { name: "Done", value: "done" },
  ];

  const ActionsItem = ({ name, value, resId }) => {
    return (
      <li>
        <button
          onClick={() => handleStatus(resId, value)}
          className="block px-4 py-1 hover:bg-gray-100 w-[100%]"
        >
          {name}
        </button>
      </li>
    );
  };

  const [keyboardShow, setKeyboardShow] = useState(false);
  const keyboardRef = useRef(null);
  const { isVisible, os } = useDeviceVisibility();
  const [focusedInput, setFocusedInput] = useState(null);
  // const handleKeyboardInput = (value) => {
  //   setInputs({ [focusedInput]: value });
  // };
  useEffect(() => {
    if (focusedInput !== null) {
      setKeyboardShow(true);
      if (keyboardRef.current) {
        keyboardRef.current.setInput(inputs[focusedInput] || ""); // Sets initial value in keyboard
      }
    } else {
      setKeyboardShow(false);
      if (keyboardRef.current) {
        keyboardRef.current.setInput(""); // Clears the keyboard input
      }
    }
  }, [focusedInput, inputs]); // Add `inputs` as a dependency here

  return (
    <ProtectedRoute pageName={"menu-items"}>
      {/* <CustomKeyboard
        onChange={(e) => {
          handleKeyboardInput(e);
        }}
        isShow={keyboardShow}
        setIsShow={setKeyboardShow}
        keyRef={keyboardRef}
      /> */}
      <div className="min-h-screen flex bg-[#171821]">
        <SideMenu />

        {modelIsOpen == true && <></>}

        <div className=" w-[100%] xl:pl-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6  text-black bg-[#171821]">
          <div className="px-2 md:px-10 rounded-lg py-5 bg-gray-50 w-[100%] h-[calc(100vh-48px)] overflow-y-auto">
            <div className="flex w-full">
              <div className="w-[100%] pr-[15px]">
                <div className="flex flex-col w-[100%] mt-5">
                  <div className="w-[100%] flex flex-col lg:flex-row justify-between lg:items-center my-[13px]">
                    <p className="text-[24px] py-2">Manage Reservations</p>
                    <div className="flex flex-col sm:flex-row space-x-2 items-start sm:items-center max-w-full">
                      <div className="flex flex-col sm:flex-row gap-1 items-start sm:items-center w-full">
                        <label>Date From :</label>
                        <input
                          type="datetime-local"
                          // type="date"
                          value={dateFrom}
                          onChange={handleDateFromChange}
                          className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px] w-[100%] sm:w-auto"
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
                        className="px-[20px] mt-2 sm:mt-0 py-2 sm:p-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-[5px]"
                      >
                        <IoSearch size={20} color="white" />
                      </button>
                    </div>
                  </div>
                  <hr />

                  <div className="flex flex-col sm:flex-row mt-5">
                    <div className="w-[100%] sm:w-fit">
                      <select
                        value={filterStatus}
                        onChange={(e) => setfilterStatus(e.target.value)}
                        className="border p-3 rounded-lg outline-none w-full"
                      >
                        <option value="all">All</option>
                        <option value="cancel">Cancel</option>
                        <option value="booked">Booked</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        handleModal({
                          heading: "Add New Reservation",
                          operation: "add",
                          getDataUrl: "",
                          postDataUrl: "menus/category",
                        });
                      }}
                      type="button"
                      className="w-[100%] sm:w-fit mt-3 sm:mt-0 ml-auto p-2 text-white bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-md font-bold"
                    >
                      Create Reservation
                    </button>
                  </div>

                  <div className="flex mt-5"></div>
                  {/* table  */}
                  <div className="relative overflow-x-auto min-h-screen h-full overflow-y-hidden">
                    <table className="w-full border text-left">
                      <thead>
                        <tr className="bg-[#055938] text-[#ffffff] whitespace-nowrap">
                          <th className="px-7 py-3 text-[18px] font-medium">
                            Customer Name
                          </th>
                          <th className="px-7 py-3 text-[18px] font-medium">
                            Phone
                          </th>
                          <th className="px-7 py-3 text-[18px] font-medium">
                            People
                          </th>
                          <th className="px-7 py-3 text-[18px] font-medium">
                            Start Time
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
                        {data?.length > 0 ? (
                          <>
                            {data
                              .filter((item) =>
                                filterStatus === "all"
                                  ? ["cancel", "booked", "done"].includes(
                                      item?.status
                                    )
                                  : item?.status === filterStatus
                              )
                              .map((item, index) => {
                                const start_date = moment
                                  .utc(item?.start_from)
                                  .format("LT, MMM DD, YYYY");
                                return (
                                  <tr
                                    key={index}
                                    className="border-b bg-white text-[14px]"
                                  >
                                    <td className="px-7 py-2 lg:py-3 whitespace-nowrap">
                                      {item?.customer_name}
                                    </td>
                                    <td className="px-7 py-2 lg:py-3 whitespace-nowrap">
                                      {item?.phone ?? "....."}
                                    </td>
                                    <td className="px-7 py-2 lg:py-3 whitespace-nowrap">
                                      {item?.num_of_people}
                                    </td>
                                    <td className="px-7 py-2 lg:py-3 whitespace-nowrap">
                                      {start_date}
                                    </td>
                                    <td className="px-7 py-2 lg:py-3 whitespace-nowrap">
                                      {item?.status === "cancel" ? (
                                        <p className="py-1 text-center rounded-full bg-[#F7C8C8] text-[#EE3050] px-3">
                                          Cancel
                                        </p>
                                      ) : item.status === "booked" ? (
                                        <p className="py-1 text-center rounded-full bg-blue-100 px-3 text-blue-500">
                                          Booked
                                        </p>
                                      ) : item.status === "done" ? (
                                        <p className="py-1 text-center rounded-full bg-[#E2F6D9] text-[#055938] px-3">
                                          Done
                                        </p>
                                      ) : (
                                        ""
                                      )}
                                    </td>
                                    <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                      <Actions
                                        item={item}
                                        navActions={[
                                          {
                                            title: "Cancel",
                                            func: () =>
                                              handleStatus(item.id, "cancel"),
                                          },
                                          {
                                            title: "Booked",
                                            func: () =>
                                              handleStatus(item.id, "booked"),
                                          },
                                          {
                                            title: "Done",
                                            func: () =>
                                              handleStatus(item.id, "done"),
                                          },
                                          {
                                            title: "Reschedule",
                                            func: () =>
                                              handleModal({
                                                reservation_id: item.id,
                                                heading:
                                                  "Reschedule Reservation",
                                                operation: "update",
                                                selectedStartDate:
                                                  item?.start_from,
                                                getDataUrl: "",
                                                postDataUrl: "",
                                              }),
                                          },
                                        ]}
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                          </>
                        ) : null}
                      </tbody>
                    </table>
                    {pageCurrent >= metaData?.last_page ? (
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
                  </div>

                  {/* Load More button */}
                  <div className="my-5 flex justify-center">
                    {pageCurrent >= metaData?.last_page ? (
                      <></>
                    ) : (
                      <button
                        onClick={() => {
                          handleLoadMore();
                        }}
                        className="font-light text-white hover:underline cursor-pointer bg-gray-800 px-3 py-1"
                      >
                        Load More
                      </button>
                    )}
                  </div>
                  {/* Load More  button end */}

                  {/* here is modal */}

                  <Modal
                    isOpen={modelIsOpen}
                    heading={currentModalData?.heading}
                    onClose={() => {
                      setInputs(initialState);
                      setIsOpen(false);
                      setAlert({ type: "danger", message: "" });
                    }}
                  >
                    {currentModalData?.operation == "add" ? (
                      <>
                        <div className="flex flex-col space-y-1">
                          <span>Customer Name*</span>
                          <CreateCustomer
                            merchant={merchant}
                            customer={customer}
                            setCustomer={setCustomer}
                            type={true}
                            modalIsOpen={isModalOpen1}
                            setIsModalOpen={setIsModalOpen1}
                          />
                        </div>
                        <form onSubmit={handleSubmit}>
                          <div className="w-[100%] text-[14px] text-black">
                            <div className="flex flex-col py-3 space-y-1">
                              <span>Phone*</span>
                              <input
                                type="number"
                                name="phone"
                                value={inputs?.phone ?? ""}
                                onChange={handleInputs}
                                placeholder="Enter Phone"
                                className="w-[100%] border-2 p-2 rounded-md outline-none"
                                // onFocus={() => {
                                //   setFocusedInput("phone");
                                // }}
                                // readOnly={
                                //   os == "android" && isVisible == true
                                //     ? true
                                //     : false
                                // }
                              />
                            </div>

                            <div className="flex flex-col py-3 space-y-1">
                              <span>Number of People*</span>
                              <input
                                type="number"
                                name="num_of_people"
                                value={inputs?.num_of_people ?? ""}
                                onChange={handleInputs}
                                placeholder="Number of People"
                                className="w-[100%] border-2 p-2 rounded-md outline-none"
                                required
                                // onFocus={() => {
                                //   setFocusedInput("num_of_people");
                                // }}
                                // readOnly={
                                //   os == "android" && isVisible == true
                                //     ? true
                                //     : false
                                // }
                              />
                            </div>

                            <div className="flex flex-col py-3 space-y-1">
                              <span>Start Time*</span>
                              <input
                                type="datetime-local"
                                name="start_from"
                                value={start_time}
                                onChange={handleStartTime}
                                min={dateNow}
                                className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                              />
                            </div>
                            <div className="flex justify-center space-x-4 w-[100%]">
                              <button
                                type="submit"
                                className="w-[70px] px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                                disabled={loading == true ? loading : loading}
                              >
                                {loading == true ? <CSpinner /> : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsModalOpen(false);
                                  setIsOpen(false);
                                }}
                                className="border border-black w-[70px] px-3 py-2 rounded-[8px]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </form>
                      </>
                    ) : (
                      <form onSubmit={handleReschedule}>
                        <div className="w-[100%] text-[14px] text-black">
                          <div className="flex flex-col pb-5">
                            <span>Start Time*</span>
                            <input
                              type="datetime-local"
                              name="start_from"
                              value={startDate}
                              onChange={handleUpdateTime}
                              min={dateNow}
                              className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                            />
                          </div>
                          <div className="flex justify-center space-x-4 w-[100%]">
                            <button
                              type="submit"
                              className="w-[70px] px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                              disabled={loading == true ? loading : loading}
                            >
                              {loading == true ? <CSpinner /> : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsModalOpen(false);
                              }}
                              className="border border-black w-[70px] px-3 py-2 rounded-[8px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </Modal>

                  {/* modal end here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
