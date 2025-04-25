"use client";
import React, { useContext, useEffect, useRef } from "react";
import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { GlobalContext } from "@/context";
import SideMenu from "@/components/menus/SideMenu";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { PulseLoader } from "react-spinners";
import Modal from "@/components/modal";
import CSpinner from "@/components/common/CSpinner";
import CAlert from "@/components/common/CAlert";
import Swal from "sweetalert2";
import { getErrorMessageFromResponse } from "@/utils/helper";
import ProtectedRoute from "@/components/protected-route";
import { storageUrl } from "@/utils/api";
import Actions from "@/components/ui/action";
import useHandleInputs from "@/hooks/useHandleInputs";
import CustomKeyboard from "@/components/ui/custom-keyboard";
import useDeviceVisibility from "@/hooks/useDeviceVisibility";
import useCustomKeyboardProps from "@/components/ui/custom-keyboard-props";

const ManageModal = (props) => {
  const { setMerchant } = useContext(GlobalContext);
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

  const [currencies, setCurrency] = useState([]);
  const getCurrencies = () => {
    getRequest(`/get-currency`, {}, true).then((res) => {
      setCurrency(res?.data);
    });
  };

  const initialState = {
    name: "",
    address: "",
    currency_id: "",
    tax: "",
    phone_no: "",
    image_src: "",
    is_tax_separate: false,
    card_tax: "",
    cash_tax: "",
  };

  const [inputs, handleInputs, setInputs] = useHandleInputs(initialState);

  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${getDataUrl}`).then((res) => {
      setLoading(false);
      setInputs({
        name: res?.data?.name,
        address: res?.data?.address,
        currency_id: res?.data?.currency_id,
        tax: res?.data?.tax?.tax || null,
        phone_no: res?.data?.phone_no || "",
        is_tax_separate: res?.data?.is_tax_separate || false,
        cash_tax: res?.data?.cash_tax?.tax || null,
        card_tax: res?.data?.card_tax?.tax || null,
      });
    });
  };

  const handleSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
    let url = "";
    if (postDataUrl !== "") {
      url = "/" + postDataUrl;
    }
    postRequest(
      `/merchant${url}`,
      inputs,
      operation == "update" ? "put" : "post"
    )
      .then((res) => {
        Swal.fire({
          text: res.data.message,
          icon: "success",
        });
        event.target.reset();
        setInputs({
          name: res?.data?.data?.name,
          address: res?.data?.data?.address,
          currency_id: res?.data?.data?.currency_id,
          tax: res?.data?.data?.tax?.tax || null,
          phone_no: res?.data?.data?.phone_no || "",
          is_tax_separate: res?.data?.data?.is_tax_separate || false,
          cash_tax: res?.data?.data?.cash_tax?.tax || null,
          card_tax: res?.data?.data?.card_tax?.tax || null,
        });
        setIsDataUpdated(true);
        setIsModalOpen(false);
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getCurrencies();
  }, []);

  useEffect(() => {
    if (operation == "update" && getDataUrl !== "") {
      getData();
    } else {
      setInputs(initialState);
    }
  }, [operation, getDataUrl]);

  const {
    handleInputFocus,
    handleKeyboardInput,
    isNumericType,
    isVisible,
    keyboardRef,
    keyboardShow,
    os,
    setIsNumericType,
    setKeyboardShow,
  } = useCustomKeyboardProps(inputs, setInputs);

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
        <CustomKeyboard
          onChange={(e) => {
            handleKeyboardInput(e);
          }}
          isShow={keyboardShow}
          setIsShow={setKeyboardShow}
          keyRef={keyboardRef}
          useNumericLayout={isNumericType}
        />
        {alert.message && <CAlert color={alert.type}>{alert.message}</CAlert>}
        <form onSubmit={handleSubmit}>
          <div className="w-[100%] text-[14px] text-black">
            <div className="flex flex-col space-y-1">
              <span>Merchant Name*</span>
              <input
                type="text"
                name="name"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                required
                value={inputs?.name ?? ""}
                onChange={handleInputs}
                placeholder="Enter Merchant Name"
                onFocus={() => {
                  setIsNumericType(false);
                  handleInputFocus("name");
                }}
                readOnly={os == "android" && isVisible == true ? true : false}
              />
            </div>
            <div className="flex flex-col py-3 space-y-1">
              <span>Address*</span>
              <input
                type="text"
                name="address"
                required
                value={inputs?.address ?? ""}
                onChange={handleInputs}
                placeholder="Enter Address"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                onFocus={() => {
                  setIsNumericType(false);
                  handleInputFocus("address");
                }}
                readOnly={os == "android" && isVisible == true ? true : false}
              />
            </div>
            <div className="flex flex-col py-3 space-y-1">
              <span>Phone</span>
              <input
                type="number"
                name="phone_no"
                value={inputs?.phone_no ?? ""}
                onChange={handleInputs}
                placeholder="Enter Your Phone Number"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                onFocus={() => {
                  setIsNumericType(true);
                  handleInputFocus("phone_no");
                }}
                readOnly={os == "android" && isVisible == true ? true : false}
              />
            </div>

            <div className="flex flex-col py-3 space-y-1">
              <span>Select Currency*</span>
              <select
                name="currency_id"
                onChange={handleInputs}
                placeholder="Select Status"
                className="h-[40px] border-2 rounded-md px-[8px]"
                required
                value={inputs?.currency_id}
              >
                {currencies && currencies.length > 0 ? (
                  <>
                    {currencies.map((item, index) => (
                      <option
                        // selected={inputs.currency_id == item.id}
                        key={index}
                        value={item.id}
                      >
                        {item.symbol + " " + item.short_name}
                      </option>
                    ))}
                  </>
                ) : (
                  <></>
                )}
              </select>
            </div>

            <div className="flex justify-between my-[12px] items-center">
              <div>
                <h5>Tax Type</h5>
                <p className="text-[10px]">
                  Switch on to charge tax based on cash and card
                </p>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    onChange={() => {
                      setInputs({
                        ...inputs,
                        is_tax_separate: inputs?.is_tax_separate == 1 ? 0 : 1,
                      });
                    }}
                    name="selection_type"
                    checked={inputs?.is_tax_separate == 1 ? true : false}
                    value="1"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7DE143]"></div>
                </label>
              </div>
            </div>

            {inputs?.is_tax_separate == false ? (
              <>
                <div className="flex flex-col py-3 space-y-1">
                  <span>Tax (%)</span>
                  <input
                    type="number"
                    name="tax"
                    value={inputs?.tax ?? ""}
                    onChange={handleInputs}
                    min={0}
                    placeholder="Enter Goods and Service Tax"
                    className="w-[100%] border-2 p-2 rounded-md outline-none"
                    onFocus={() => {
                      setIsNumericType(true);
                      handleInputFocus("tax");
                    }}
                    readOnly={
                      os == "android" && isVisible == true ? true : false
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col py-3 space-y-1">
                  <span>Card Tax (%)</span>
                  <input
                    type="number"
                    name="card_tax"
                    value={inputs?.card_tax ?? ""}
                    onChange={handleInputs}
                    min={0}
                    placeholder="Enter Card Tax"
                    className="w-[100%] border-2 p-2 rounded-md outline-none"
                    onFocus={() => {
                      setIsNumericType(true);
                      handleInputFocus("card_tax");
                    }}
                    readOnly={
                      os == "android" && isVisible == true ? true : false
                    }
                  />
                </div>
                <div className="flex flex-col py-3 space-y-1">
                  <span>Cash Tax (%)</span>
                  <input
                    type="number"
                    name="cash_tax"
                    value={inputs?.cash_tax ?? ""}
                    onChange={handleInputs}
                    min={0}
                    placeholder="Enter Cash Tax"
                    className="w-[100%] border-2 p-2 rounded-md outline-none"
                    onFocus={() => {
                      setIsNumericType(true);
                      handleInputFocus("cash_tax");
                    }}
                    readOnly={
                      os == "android" && isVisible == true ? true : false
                    }
                  />
                </div>
              </>
            )}

            <div className="flex flex-col py-3 space-y-1">
              <span>Upload Logo</span>
              <input
                type="file"
                name="image_src"
                onChange={handleInputs}
                placeholder="Upload Item Image"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
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
      </Modal>
    </>
  );
};

export default function Merchants() {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const getData = () => {
    let url;
    if (search) {
      url = `/merchant?search=${search}`;
    } else {
      url = `/merchant`;
    }
    getRequest(url).then((res) => {
      setPageLevelLoader(false);
      setData(res?.data);
      setIsDataUpdated(false);
    });
  };

  useEffect(() => {
    if (merchant.id !== undefined && user) getData();
  }, [user, search, merchant]);

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
    <ProtectedRoute pageName={"merchants"}>
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
        {/* min-h-full */}
        <div className="w-[100%] xl:ml-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6 h-screen overflow-auto text-black">
          <div className="w-[100%]   bg-[#F8F8F8] rounded-[20px] h-[calc(100vh-48px)] overflow-y-auto py-10 lg:p-10 px-3 md:px-8  lg:pr-16">
            <div className="w-[100%] border-b-2 text-[24px] py">Merchants</div>
            <div className="w-[100%] flex flex-col md:flex-row items-end justify-between py-5 gap-4 md:items-center">
              <input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                required
                className="border p-3 sm:p-4 placeholder:text-[14px] sm:placeholder:text-[16px] w-[100%] md:w-[45%] rounded-[15px] bg-[#F8F8F8] outline-none"
                placeholder="Search..."
              />
              <button
                onClick={() => {
                  handleModal({
                    heading: "Add New Merchant",
                    operation: "add",
                    getDataUrl: "",
                    postDataUrl: "",
                  });
                }}
                id="shadow"
                className="bg-white px-4 py-2 text-[14px] rounded-[10px] flex space-x-3"
              >
                <img src="/images/Vector1.png" />
                <p>Add Merchant</p>
              </button>
            </div>
            <div className="relative overflow-x-auto min-h-screen h-full overflow-y-hidden">
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-[#055938] text-[#ffffff]"> 
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Merchant Name
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Address
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">Phone</th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Currency
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">Tax</th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data && data.length > 0 ? (
                    <>
                      {data?.map((item) => (
                        <tr
                          key={item?.id}
                          className="border-b bg-white text-[14px]"
                        >
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap flex justify-start items-center">
                            <div
                              className="w-[50px] h-[50px] flex items-center justify-center"
                              style={{
                                border: "1px solid #cdcdcd",
                                borderRadius: "50px",
                                overflow: "hidden",
                                marginRight: "10px",
                              }}
                            >
                              {item?.image_src ? (
                                <img
                                  src={`${storageUrl}/merchants/${item?.image_src}`}
                                  alt={item?.name}
                                />
                              ) : (
                                <>
                                  <img
                                    src="/images/Vector1.png"
                                    alt={item?.name}
                                  />
                                </>
                              )}
                            </div>
                            {item?.name}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.address}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.phone_no ?? "--"}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            <span className="bg-[#DDF1D1] text-center rounded-full text-[#055938] py-[5px] px-[15px]">
                              {item?.currency?.short_name}{" "}
                              {item?.currency?.symbol}
                            </span>
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.is_tax_separate == true ? (
                              <>
                                <div className="flex flex-col">
                                  <div>
                                    <span>Cash Tax: </span>
                                    <span>{item?.cash_tax?.tax ?? 0}%</span>
                                  </div>
                                  <div>
                                    <span>Card Tax: </span>
                                    <span>{item?.card_tax?.tax ?? 0}%</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>{item?.tax?.tax ?? 0}%</>
                            )}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            <Actions
                              item={item}
                              navActions={[
                                {
                                  title: "Edit",
                                  func: () =>
                                    handleModal({
                                      heading: "Update Merchant",
                                      operation: "update",
                                      getDataUrl: item?.id,
                                      postDataUrl: item?.id,
                                    }),
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
                                  className="border-2 bg-white invisible border-gray-800 rounded absolute right-5 -top-10 transition-all opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-1 z-10"
                                >
                                  <ul className="py-1">
                                    <li>
                                      <button
                                        onClick={() => {
                                          handleModal({
                                            heading: "Update Merchant",
                                            operation: "update",
                                            getDataUrl: item?.id,
                                            postDataUrl: item?.id,
                                          });
                                        }}
                                        className="block px-4 py-2 hover:bg-gray-100 w-[100%]"
                                      >
                                        Edit
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                      href="#"
                                      className="block px-4 py-2 hover:bg-gray-100"
                                    >
                                      Delete
                                    </button> 
                                    </li>
                                  </ul>
                                </nav>
                              </div>
                            </div>
                          </td>*/}
                        </tr>
                      ))}
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
