"use client";
import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { GlobalContext } from "@/context";
import SideMenu from "@/components/menus/SideMenu";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { PulseLoader } from "react-spinners";
import Modal from "@/components/modal";
import CSpinner from "@/components/common/CSpinner";
import InputField from "@/components/common/InputField";
import CAlert from "@/components/common/CAlert";
import { getErrorMessageFromResponse } from "@/utils/helper";
import Swal from "sweetalert2";
import ProtectedRoute from "@/components/protected-route";
import { kdsURL, posURL } from "@/utils/api";
import Actions from "@/components/ui/action";
import useHandleInputs from "@/hooks/useHandleInputs";

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
    name: "",
    type: "",
  };

  const [inputs, handleInputs, setInputs] = useHandleInputs(initialState);

  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/${getDataUrl}`).then((res) => {
      setLoading(false);
      setInputs({
        name: res?.data?.name,
        type: res?.data?.type,
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
        setTimeout(() => setAlert({ type: "danger", message: "" }), 2000);
        setIsDataUpdated(true);
        event.target.reset();
        setInputs(operation == "update" ? res.data.data : initialState);
        setCode(res?.data?.data?.code);
        setSendCode({ device_id: res?.data?.data?.id });
        setModelId(model_id.complete);
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

  const model_id = {
    complete: "complete",
    send_code: "send_code",
  };
  const [sendCode, setSendCode] = useState({
    email: "",
    device_id: "",
  });
  const [code, setCode] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [deviceType, setDeviceType] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");
  const copyText = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopySuccess("Copied!");
        setTimeout(() => setCopySuccess(""), 1000); // Hide the message after 2 seconds
      })
      .catch((err) => {
        setCopySuccess("Failed to copy");
        console.error("Failed to copy text: ", err);
      });
  };
  const handleCodeSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    postRequest("/device/send/code", { ...sendCode, deviceType })
      .then((res) => {
        setAlert({ message: res.data.message, type: "success" });
      })
      .catch((err) => {
        if (err?.response?.data?.messages) {
          for (const [key, value] of Object.entries(
            err.response.data.messages
          )) {
            setAlert({ ...alert, message: value[0], type: "danger" });
          }
        } else {
          setAlert({
            ...alert,
            message: err?.response?.data?.message,
            type: "danger",
          });
        }
      })
      .finally(() => {
        setTimeout(() => setAlert({ type: "danger", message: "" }), 2000);
        setLoading(false);
      });
  };

  const getDeviceTypeName = () => {
    switch (deviceType) {
      case "1":
        return "Standard POS";
      case "2":
        return "KDS (Kitchen Display System)";
      case "3":
        return "Self Service Kiosk";
      default:
        return "Unknown Device Type";
    }
  };

  const getDeviceTypeLink = () => {
    switch (deviceType) {
      case "1":
        return posURL;
      case "2":
        return kdsURL;
      case "3":
        return "#";
      default:
        return "#";
    }
  };
  return (
    <>
      <Modal
        isOpen={modelIsOpen}
        heading={heading}
        onClose={() => {
          if (modelId == model_id.complete) {
            setInputs(initialState);
            setIsModalOpen(false);
            setCode(null);
            setSendCode({ email: "", device_id: "" });
            setModelId(null);
            setAlert({ message: "", type: "danger" });
            setDeviceType(null);
          } else if (modelId == model_id.send_code) {
            setModelId(model_id.complete);
          } else {
            setInputs(initialState);
            setIsModalOpen(false);
            setCode(null);
            setSendCode({ email: "", device_id: "" });
            setModelId(null);
            setAlert({ message: "", type: "danger" });
            setDeviceType(null);
          }
        }}
      >
        {alert.message && <CAlert color={alert.type}>{alert.message}</CAlert>}
        <div className={`${modelId == model_id.send_code ? "" : "hidden"}`}>
          <div>
            <h5 className="text-[14px] font-[700]">Send Code to an Email</h5>
            <p className="text-[14px] mb-[10px]">
              Send this device code to an email with instructions on how to sign
              in to SynkoTech {getDeviceTypeName()}.
            </p>
            <form onSubmit={handleCodeSubmit}>
              <InputField
                placeholder="Enter email"
                onChange={(e) => {
                  setSendCode({ ...sendCode, email: e.target.value });
                }}
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white mt-[10px]"
                disabled={loading == true ? loading : loading}
              >
                {loading == true ? <CSpinner /> : "Send Code"}
              </button>
            </form>
          </div>
        </div>
        <div className={`${modelId == model_id.complete ? "" : "hidden"}`}>
          <div>
            <h5 className="text-[14px] font-[700]">
              1. NAVIGATE TO THE WEB OR APP
            </h5>
            <p className="text-[14px]">
              Go to the{" "}
              <a
                href={getDeviceTypeLink()}
                target="_blank"
                className="text-[blue]"
              >
                {getDeviceTypeLink()}
              </a>{" "}
              OR APP
            </p>
          </div>
          <hr className="!my-[30px]" />
          <div>
            <h5 className="text-[14px] font-[700]">2. SIGN IN</h5>
            <p className="text-[14px] mb-[10px]">
              Use this device code to sign in to SynkoTech {getDeviceTypeName()}
              .
            </p>

            {copySuccess && (
              <div className="text-[white] py-[6px] px-[10px] bg-black w-fit text-[10px]">
                {copySuccess}
              </div>
            )}
            <div className="flex justify-between items-center">
              <button
                onClick={() => copyText(code ?? "")}
                className="font-[600] text-[25px]"
              >
                {code ?? ""}
              </button>
              <button
                onClick={() => {
                  setModelId(model_id.send_code);
                }}
                className="text-[#055938] text-[10px] font-[600]"
              >
                Send Device Code
              </button>
            </div>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className={`${modelId !== null ? "hidden" : ""}`}
        >
          <div className="w-[100%] text-[14px] text-black">
            <div className="flex flex-col space-y-1">
              <span>Device Name*</span>
              <input
                type="text"
                name="name"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                required
                value={inputs?.name ?? ""}
                onChange={handleInputs}
                placeholder="Enter Device Name"
              />
            </div>

            <div className="flex flex-col py-3 space-y-1">
              <span>Select Device Type*</span>
              <select
                name="type"
                onChange={(e) => {
                  handleInputs(e);
                  setDeviceType(e.target.value);
                }}
                placeholder="Select Device Type"
                className="h-[40px] border-2 rounded-md px-[8px]"
                required
                value={inputs?.type}
              >
                <option value="">Select Device Type</option>
                <option value="1">Standard POS</option>
                <option value="2">KDS (Kitchen Display System)</option>
                <option value="3">Self Service Kiosk</option>
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

export default function Devices() {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [searchDevice, setSearchDevice] = useState("");

  const getData = () => {
    getRequest(
      `/merchant/${merchant?.id}/device?searchDevice=${searchDevice}`
    ).then((res) => {
      setPageLevelLoader(false);
      setData(res?.data);
      setIsDataUpdated(false);
    });
  };

  const handleDelete = (id) => {
    setLoading(true);
    setSelectedId(id);
    postRequest(`/merchant/${merchant?.id}/device/${id}`, {}, "delete")
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

  useEffect(() => {
    if (merchant.id !== undefined && user) getData();
  }, [user, merchant, searchDevice]);

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
  return (
    <ProtectedRoute pageName={"devices"}>
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
              Manage Devices
            </div>
            <div className="w-[100%] flex flex-col md:flex-row items-end justify-between py-5 gap-4 md:items-center">
              <input
                onChange={(e) => {
                  setSearchDevice(e.target.value);
                }}
                className="border p-3 sm:p-4 placeholder:text-[14px] sm:placeholder:text-[16px] w-full sm:w-[60%] md:w-[45%] rounded-[15px] bg-[#F8F8F8] outline-none"
                placeholder="Search..."
              />
              <button
                onClick={() => {
                  handleModal({
                    heading: "Add Device",
                    operation: "add",
                    getDataUrl: "",
                    postDataUrl: "device",
                  });
                }}
                id="shadow"
                className="bg-white px-4 py-2 text-[14px] rounded-[10px] flex space-x-3"
              >
                <img src="/images/Vector1.png" />
                <p>Add Device</p>
              </button>
            </div>
            <div className="relative overflow-x-auto min-h-screen h-full overflow-y-hidden">
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-[#055938] text-[#ffffff]">
                    <th className="px-7 py-3 text-[18px] font-medium">Name</th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Device Code
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">Type</th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data && data.length > 0 ? (
                    <>
                      {data?.map((item) => {
                        const deviceType = {
                          1: (
                            <div className="text-[#ffffff] bg-[#055959]  px-2 py-1 w-fit text-center rounded-[5px]">
                              Standard POS
                            </div>
                          ),
                          2: (
                            <div className="text-[#ffffff] bg-[#3092ee]  px-2 py-1 w-fit text-center rounded-[5px]">
                              KDS (Kitchen Display System)
                            </div>
                          ),
                          3: (
                            <div className="text-[#ffffff] bg-[#30ee9f]  px-2 py-1 w-fit text-center rounded-[5px]">
                              Self Service Kiosk
                            </div>
                          ),
                        };

                        return (
                          <tr
                            key={item?.id}
                            className="border-b bg-white text-[14px]"
                          >
                            <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              {item?.name}
                            </td>
                            <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              {item?.code}
                            </td>
                            <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              {deviceType[item?.type]}
                            </td>
                            <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              <Actions
                                item={item}
                                navActions={[
                                  {
                                    title: "Delete",
                                    func: () => handleDelete(item?.id),
                                  },
                                ]}
                              />
                            </td>
                            {/* <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              <div className="p-4">
                                <div className="group relative">
                                  <button>
                                    <BsThreeDots size={22} />
                                  </button>
                                  <nav
                                    tabIndex="0"
                                    className="border-2 bg-white invisible border-gray-800 rounded absolute right-7 sm:right-10 md:right-14 -top-2 transition-all opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-1 z-10"
                                  >
                                    <ul className="py-1">
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
                            </td> */}
                          </tr>
                        );
                      })}
                    </>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
