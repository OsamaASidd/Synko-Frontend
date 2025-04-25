"use client";
import React, { use, useContext, useEffect } from "react";
import { useState } from "react";
import { GlobalContext } from "@/context";
import SideMenu from "@/components/menus/SideMenu";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { PulseLoader } from "react-spinners";
import Modal from "@/components/modal";
import CSpinner from "@/components/common/CSpinner";
import CAlert from "@/components/common/CAlert";
import { getErrorMessageFromResponse } from "@/utils/helper";
import Swal from "sweetalert2";
import Tabs from "@/components/Tabs/tabs";
import { TbTruckDelivery } from "react-icons/tb";
import AddTimingModal from "@/components/custome_modals/addTimingModal";
import timezones from "timezones-list";
import { FaEdit } from "react-icons/fa";
// import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import ProtectedRoute from "@/components/protected-route";
const ManageModal = (props) => {
  const { merchant } = useContext(GlobalContext);
  const {
    modelIsOpen,
    setIsModalOpen,
    heading = "Modal",
    operation = "add",
    getDataUrl = "",
    postDataUrl = "",
    setIsDataUpdated,
  } = props;

  const [alert, setAlert] = useState({ type: "danger", message: "" });
  const [loading, setLoading] = useState(false);

  const initialState = {
    opening_time: "",
    status: "",
    day: "",
    merchant_id: "",
    closing_time: "",
  };

  const [inputs, setInputs] = useState(initialState);

  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/${getDataUrl}`).then((res) => {
      setLoading(false);
      setInputs({
        closing_time: res?.data?.closing_time,
        opening_time: res?.data?.opening_time,
        status: res?.data?.status,
        day: res?.data?.day,
      });
    });
  };

  const handleSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
    let url = "";
    if (postDataUrl !== "") {
      url = postDataUrl;
    }
    postRequest(
      `/merchant/${merchant?.id}/${url}`,
      inputs,
      operation == "update" ? "put" : "post"
    )
      .then((res) => {
        Swal.fire({
          text: res.data.message,
          icon: "success",
        });
        event.target.reset();
        setInputs(operation == "update" ? res.data.data : initialState);
        setIsDataUpdated(true);
        setIsModalOpen(false);
        setAlert({ type: "danger", message: "" });
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (operation == "update" && getDataUrl !== "") {
      getData();
    } else {
      setInputs(initialState);
    }
  }, [operation, getDataUrl]);

  const handleInputs = (event) => {
    setInputs((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <>
      <Modal
        isOpen={modelIsOpen}
        heading={heading}
        onClose={() => {
          setInputs(initialState);
          setIsModalOpen(false);
          setAlert({ type: "danger", message: "" });
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="w-[100%] text-[14px] text-black">
            {alert.message && (
              <CAlert color={alert.type}>{alert.message}</CAlert>
            )}
            <div className="flex flex-col space-y-1 mb-[8px]">
              <span>Day*</span>
              {/*                             
                            <input
                                type="text"
                                name="day"
                                className="w-[100%] border-2 p-2 rounded-md outline-none"
                                value={inputs?.day ?? ""}
                                onChange={handleInputs}
                                required
                                placeholder="select day"
                            /> */}

              <select
                name="day"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                value={inputs.day}
                onChange={handleInputs}
                required
              >
                <option value="">Select day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1 mb-[8px]">
              <span>Opening Time</span>
              <input
                type="time"
                name="opening_time"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                value={inputs?.opening_time ?? ""}
                onChange={handleInputs}
                placeholder="Enter opening time"
              />

              {/* <span>Opening Time</span>
                            <TimePicker
                                name="opening_time"
                                className="w-[100%] border-2 p-2 rounded-md outline-none mt-2"
                                value={inputs.opening_time}
                                onChange={(value) => handleInputs("opening_time", value)}
                            /> */}
            </div>

            <div className="flex flex-col space-y-1 mb-[8px]">
              <span>Closing Time</span>
              <input
                type="time"
                name="closing_time"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                value={inputs?.closing_time ?? ""}
                onChange={handleInputs}
                placeholder="Enter pening time"
              />
            </div>

            <div className="flex flex-col space-y-1 mb-[8px]">
              <span>Status</span>
              {/* <input
                                type="text"
                                name="status"
                                className="w-[100%] border-2 p-2 rounded-md outline-none"
                                value={inputs?.status ?? ""}
                                onChange={handleInputs}
                                placeholder="Enter Team member phone no"
                            /> */}

              <select
                name="status"
                className="w-[100%] border-2 p-2 rounded-md outline-none mt-2"
                value={inputs.status}
                onChange={handleInputs}
                required
              >
                <option value="">Select status</option>
                <option value="Open">Open</option>
                <option value="Close">Close</option>
              </select>
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
      </Modal>
    </>
  );
};

export default function ManageTiming() {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);

  const [data, setData] = useState([]);

  const [mydata, setMydata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  // tabs
  // tabs data userState
  const [tabs_heading, setTabs] = useState([
    { value: "Store Timing", id: 0, selected: true },
    { value: "Delivery Timing", id: 1, selected: false },
  ]);
  const [tab_status, setTabStatus] = useState(0);
  const [TimingModalOpen, setTimingModalOpen] = useState(false);
  let initialSates = {
    start_time: "",
    end_time: "",
    time_zone: "",
  };
  const [deliveryTiming, setdeliveryTiming] = useState(initialSates);
  const [deliveryTimingData, setdeliveryTimingData] = useState([]);
  const [inputs, setInputs] = useState({
    time_zone: "", // Initialize with default value
  });

  const getData = () => {
    getRequest(`/merchant/${merchant?.id}/shoptiming`).then((res) => {
      setPageLevelLoader(false);
      setMydata(res?.data);
      setIsDataUpdated(false);
    });
  };

  const handleDelete = (id) => {
    setLoading(true);
    setSelectedId(id);
    postRequest(`/merchant/${merchant?.id}/shoptiming/${id}`, {}, "delete")
      .then((res) => {
        getData();
      })
      .catch((err) => {
        if (err?.response?.data?.messages) {
          for (const [key, value] of Object.entries(
            err.response.data.messages
          )) {
            alert(value[0]);
          }
        } else {
          alert(err?.response?.data?.message);
        }
      })
      .finally(() => {
        setLoading(false);
        setSelectedId(0);
      });
  };

  const get_DeliveryTiming = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant.id}/delivery-timing`).then((res) => {
      let array = res?.data?.data;
      console.log("testing array ", array);
      setdeliveryTiming(array);
      setdeliveryTimingData(array);

    });
  };



  useEffect(() => {
    if (merchant.id !== undefined && user) getData();
    get_DeliveryTiming();
  }, [user, merchant]);

  const [dataUpdated, setIsDataUpdated] = useState(null);
  useEffect(() => {
    if (dataUpdated == true) {
      getData();
    }
  }, [dataUpdated]);

  const handleModal = (data) => {
    setIsModalOpen(true);
    setCurrentModalData(data);
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

  const handleTab = (id) => {
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

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const deliveryInput = (e) => {
    const { name, value } = e.target;
    setdeliveryTiming((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function createDealiveryTimingPostRequest() {
    postRequest(`/merchant/${merchant.id}/delivery-timing`, deliveryTiming)
      .then((res) => {
        if (res.status == 200) {
          Swal.fire({
            text: res.data.message,
            icon: "success",
          });
          setTimingModalOpen(false);
          get_DeliveryTiming();
        } else {
          Swal.fire({
            text: res.data.message,
            icon: "error",
          });
        }
      })
      .catch((err) => { })
      .finally(() => { });
  }

  const handleCreateDeliverySubmit = (e) => {
    e.preventDefault();
    createDealiveryTimingPostRequest();
  };

  const options = timezones.map((item) => ({
    value: item?.tzCode,
    label: item?.name,
  }));
  const defaultValue = timezones.find(
    (item) => item?.tzCode === deliveryTiming?.time_zone
  );

  return (
    <ProtectedRoute pageName={"timings"}>
      <div className="min-h-screen flex bg-[#171821]">
        <SideMenu />

        {modelIsOpen == true && (
          <ManageModal
            modelIsOpen={modelIsOpen}
            setIsModalOpen={setIsModalOpen}
            heading={currentModalData?.heading}
            operation={currentModalData?.operation}
            getDataUrl={currentModalData?.getDataUrl}
            postDataUrl={currentModalData?.postDataUrl}
            setIsDataUpdated={setIsDataUpdated}
          />
        )}

        <div className=" w-[100%] xl:pl-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6  text-black bg-[#171821]">
          <div className=" px-4 md:px-10 rounded-lg py-12 bg-gray-50 h-[calc(100vh-48px)] overflow-y-auto w-[100%]">
            <div className="w-[100%] border-b-2 text-[24px] py">
              Manage Timing
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-400 mt-5">
              <Tabs action={handleTab} tabs_heading={tabs_heading} />
            </div>

            <hr></hr>

            <div className="min-h-screen">
              {tab_status == 0 ? (
                <>
                  <div className="w-[100%] flex justify-end py-5 items-center">
                    <button
                      onClick={() => {
                        handleModal({
                          heading: "Add Time",
                          operation: "add",
                          getDataUrl: "",
                          postDataUrl: "shoptiming",
                        });
                      }}
                      id="shadow"
                      className="bg-white px-4 py-2 text-[14px] rounded-[10px] flex space-x-3 d-block"
                    >
                      <img src="/images/Vector1.png" />
                      <p>Update Day Time</p>
                    </button>
                  </div>
                  <div className="relative overflow-x-auto overflow-y-hidden">
                    <table className="w-full border text-left">
                      <thead>
                        <tr className="bg-[#055938] text-[#ffffff]">
                          <th className="px-7 py-3 md:text-[18px] font-medium">
                            Days
                          </th>
                          <th className="px-7 py-3 md:text-[18px] font-medium">
                            Opening Time
                          </th>
                          <th className="px-7 py-3 md:text-[18px] font-medium">
                            Closing Time
                          </th>
                          <th className="px-7 py-3 md:text-[18px] font-medium">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {days.map((day, index) => {
                          return (
                            <tr
                              key={index}
                              className="border-b bg-white text-[16px]"
                            >
                              <td className="px-7 py-3 whitespace-nowrap">
                                {day}
                              </td>
                              <td className="px-7 py-3 whitespace-nowrap">
                                {mydata?.find((item) => item?.day === day)
                                  ?.opening_time ?? "-"}
                              </td>
                              <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                {mydata?.find((item) => item?.day === day)
                                  ?.closing_time ?? "-"}
                              </td>

                              <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                {mydata?.find((item) => item?.day === day)
                                  ?.status ?? "-"}
                              </td>
                            </tr>
                          );
                        })}

                        {/* <tr
                                    className="border-b bg-white text-[14px]">
                                        <td className="px-7 py-2 lg:py-2 whitespace-nowrap">Tuesday</td>
                                </tr>
                                <tr
                                    className="border-b bg-white text-[14px]">
                                        <td className="px-7 py-2 lg:py-2 whitespace-nowrap">Wednesday</td>
                                </tr>
                                <tr
                                    className="border-b bg-white text-[14px]">
                                        <td className="px-7 py-2 lg:py-2 whitespace-nowrap">Thursday</td>
                                </tr>
                                <tr
                                    className="border-b bg-white text-[14px]">
                                        <td className="px-7 py-2 lg:py-2 whitespace-nowrap">Friday</td>
                                </tr>
                                <tr
                                    className="border-b bg-white text-[14px]">
                                        <td className="px-7 py-2 lg:py-2 whitespace-nowrap">Saturday</td>
                                </tr>
                                <tr
                                    className="border-b bg-white text-[14px]">
                                        <td className="px-7 py-2 lg:py-2 whitespace-nowrap">Sunday</td>
                                </tr> */}
                        {/* {mydata && mydata.length > 0 ? (
                                    <>
                                        {mydata?.map((item) => (
                                            <tr
                                                key={item?.id}
                                                className="border-b bg-white text-[14px]"
                                            >
                                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                                    {item?.day}
                                                </td>
                                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                                    {item?.opening_time ?? "-"}
                                                </td>
                                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                                    {item?.closing_time ?? "-"}
                                                </td>

                                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                                    {item?.status ?? "-"}
                                                </td>


                                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                                    <div className="p-4">
                                                        <div className="group relative">
                                                            <button>
                                                                <BsThreeDots size={22} />
                                                            </button>
                                                            <nav
                                                                tabIndex="0"
                                                                className="border-2 bg-white invisible border-gray-800 rounded absolute left-0 top-full transition-all opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-1 z-10"
                                                            >
                                                                <ul className="py-1">
                                                                    <li>
                                                                        <button
                                                                            onClick={() => {
                                                                                handleModal({
                                                                                    heading: "Update Time",
                                                                                    operation: "update",
                                                                                    getDataUrl: `shoptiming/${item?.id}`,
                                                                                    postDataUrl: `shoptiming/${item?.id}`,
                                                                                });
                                                                            }}
                                                                            className="block px-4 py-2 hover:bg-gray-100 w-[100%]"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button
                                                                            onClick={() => handleDelete(item?.id)}
                                                                            className="block px-4 py-2 hover:bg-gray-100 w-[100%]"
                                                                        >
                                                                            {selectedId == item?.id &&
                                                                                loading == true ? (
                                                                                <>
                                                                                    <CSpinner />
                                                                                </>
                                                                            ) : (
                                                                                <>Delete</>
                                                                            )}
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
                                ) : null} */}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <></>
              )}
              {tab_status == 1 ? (
                <>
                  {deliveryTimingData != null ? (
                    <>
                      <div className="relative overflow-x-auto overflow-y-hidden">
                        <table className="w-full border text-left mt-5">
                          <thead>
                            <tr className="bg-[#055938] text-[#ffffff]">
                              <th className="px-7 py-3 md:text-[18px] font-medium">
                                Start Time
                              </th>
                              <th className="px-7 py-3 md:text-[18px] font-medium">
                                End Time
                              </th>
                              <th className="px-7 py-3 md:text-[18px] font-medium">
                                Time Zone
                              </th>
                              <th className="px-7 py-3 md:text-[18px] font-medium">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                {deliveryTimingData?.start_time}
                              </td>
                              <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                {deliveryTimingData?.end_time}
                              </td>
                              <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                {deliveryTimingData?.time_zone}
                              </td>
                              <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setTimingModalOpen(true);
                                  }}
                                  className="cursor-pointer px-3 py-3 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white flex justify-center items-center"
                                >
                                  <FaEdit />
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center items-center h-[200px]  border border-gray-300 rounded mt-4">
                        <button
                          onClick={() => setTimingModalOpen(true)}
                          className="cursor-pointer px-3 py-5 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white flex justify-center items-center"
                        >
                          <span className="mr-2">Add Delivery Timing</span>
                          <TbTruckDelivery size={20} />
                        </button>
                      </div>
                    </>
                  )}

                  {/* add timing Modal */}
                  <AddTimingModal
                    mingModal
                    isOpen={TimingModalOpen}
                    setIsOpen={setTimingModalOpen}
                    heading={"Add Delivery Timing"}
                  >
                    {/* form */}
                    <div className="flex flex-col space-y-6 p-4">
                      <form onSubmit={handleCreateDeliverySubmit}>
                        <div className="flex flex-col ">
                          <span>Time zone</span>
                          {/* <select
                                                    className="w-[100%] border-2 p-2 rounded-md outline-none"
                                                    name="time_zone"
                                                    value={deliveryTiming?.time_zone ?? ""}
                                                    onChange={deliveryInput}
                                                >
                                                    {timezones?.map((item, index) => {
                                                        return (
                                                            <>
                                                                <option key={index} value={item?.tzCode}>
                                                                    {item?.name}
                                                                </option>
                                                            </>
                                                        );
                                                    })}
                                                </select> */}
                          {/* <CreatableSelect
                                                    name="time_zone"
                                                    options={timezones.map((item) => ({ value: item?.tzCode, label: item?.name }))}
                                                    onChange={(option) => {
                                                        deliveryInput({
                                                            target: { name: "time_zone", value: option?.value ?? "" }
                                                        });
                                                    }}
                                                    defaultValue={timezones.find((item) => item?.tzCode === deliveryTiming?.time_zone)}
                                                    placeholder="Select Time Zone"
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    value={timezones.find((item) => item?.tzCode === deliveryTiming?.time_zone)}
                                                    isClearable
                                                /> */}
                          <Select
                            options={options}
                            onChange={(option) => {
                              deliveryInput({
                                target: {
                                  name: "time_zone",
                                  value: option?.value ?? "",
                                },
                              });
                            }}
                            defaultValue={defaultValue}
                            placeholder="Select Time Zone"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isClearable
                          />
                        </div>
                        <div className="flex flex-col ">
                          <span>Start Time</span>
                          <input
                            type="time"
                            name="start_time"
                            className="w-[100%] border-2 p-2 rounded-md outline-none"
                            value={deliveryTiming?.start_time ?? ""}
                            onChange={deliveryInput}
                            placeholder="Enter opening time"
                          />
                        </div>

                        <div className="flex flex-col ">
                          <span>End Time</span>
                          <input
                            type="time"
                            name="end_time"
                            className="w-[100%] border-2 p-2 rounded-md outline-none"
                            value={deliveryTiming?.end_time ?? ""}
                            onChange={deliveryInput}
                            placeholder="Enter pening time"
                          />
                        </div>

                        <button
                          type="submit"
                          className="m-auto d-block mt-2 cursor-pointer px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white flex justify-center items-center"
                        >
                          <span className="mr-2">Submit</span>
                        </button>
                      </form>
                    </div>
                  </AddTimingModal>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
