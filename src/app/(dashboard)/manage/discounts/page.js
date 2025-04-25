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
import CAlert from "@/components/common/CAlert";
import { getErrorMessageFromResponse } from "@/utils/helper";
import Swal from "sweetalert2";
import ProtectedRoute from "@/components/protected-route";
import Actions from "@/components/ui/action";
import useCustomKeyboardProps from "@/components/ui/custom-keyboard-props";
import CustomKeyboard from "@/components/ui/custom-keyboard";
import { todayDate } from "@/utils/Dates";

const ManageModal = (props) => {
  const dateNow = new Date().toISOString().split("T")[0];

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
  const [valid_from, setValid_from] = useState("");
  const [valid_to, setValid_to] = useState("");

  const initialState = {
    status: 1,
    is_for: "discount",
    coupin_code: "",
    select_type_for: 1,
    discount_name: "",
    discount_type: 1,
    discount: "",
    valid_from: "",
    valid_to: "",
    usage_count: "",
    valid_order_amount: "",
    tag_discount: "inactive",
  };

  const [inputs, setInputs] = useState(initialState);
  const [merchants, setMerchants] = useState([]);
  const getMerchantData = () => {
    setLoading(true);
    getRequest(`/my-merchants`)
      .then((res) => {
        setMerchants(res?.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/${getDataUrl}`).then((res) => {
      setLoading(false);
      let date_valid_from = "";
      let date_valid_to = "";
      if (res?.data?.valid_from && res?.data?.valid_to) {
        date_valid_from = new Date(res?.data?.valid_from)
          .toISOString()
          .split("T")[0];
        date_valid_to = new Date(res?.data?.valid_to)
          .toISOString()
          .split("T")[0];
        setValid_from(date_valid_from);
        setValid_to(date_valid_to);
      }

      setInputs({
        status: res?.data.status == "active" ? 1 : 2,
        discount_type: 1,
        coupin_code: res?.data?.coupon_code,
        select_type_for: res?.data?.is_for_multiple,
        discount_name: res?.data?.discount_name,
        discount_type: res?.data?.discount_type == "by_percentage" ? 1 : 2,
        discount: res?.data?.discount,
        merchant_id: res?.data?.merchant_id,
        usage_count: res?.data?.usage_count,
        valid_order_amount: res?.data?.valid_order_amount,
        valid_from: date_valid_from,
        valid_to: date_valid_to,
        is_for: res?.data?.is_for,
        tag_discount: res?.data?.tag_discount,
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
    if (inputs.is_for == "coupon" && inputs.coupin_code.length < 3) {
      Swal.fire({
        text: "Coupon must have more than 3 values",
        icon: "success",
      });
      setLoading(false);
      return;
    }

    postRequest(
      `/merchant/${merchant?.id}/${url}`,
      inputs,
      operation == "update" ? "put" : "post"
    )
      .then((res) => {
        Swal.fire({
          text: res.data.message ?? "Successfully Added",
          icon: "success",
        });
        event.target.reset();
        getData();
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

  useEffect(() => {
    getMerchantData();
  }, []);

  const handleValid_from = (e) => {
    e.preventDefault();
    const newDateFrom = e.target.value;
    inputs.valid_from = newDateFrom;
    setInputs(inputs);
    setValid_from(newDateFrom);
  };

  const handleValid_to = (event) => {
    event.preventDefault();
    const newDateTo = event.target.value;
    // Validate that the "Valid to" date is not before the "Valid from" date
    if (new Date(newDateTo) < new Date(valid_from)) {
      Swal.fire({
        text: "Time cannot be before Valid from time.",
        icon: "warning",
      });
      return; // Prevent updating "Valid to" if validation fails
    }

    setValid_to(newDateTo);
    inputs.valid_to = newDateTo;
    setInputs(inputs);
  };

  const handleInputs = (event) => {
    setInputs((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

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
  } = useCustomKeyboardProps(inputs, setInputs, true);

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

        {
          <form onSubmit={handleSubmit}>
            <div className="w-[100%] text-[14px] text-black">
              {alert.message && (
                <CAlert color={alert.type}>{alert.message}</CAlert>
              )}
              <div className="flex flex-col space-y-1 mb-[8px]">
                <span>Select Discount Type</span>
                <select
                  name="is_for"
                  onChange={handleInputs}
                  placeholder="Select Status"
                  className="h-[40px] border-2 rounded-md px-[8px]"
                  required
                  value={inputs.is_for}
                >
                  <option value={"discount"}>Discount</option>
                  <option value={"coupon"}>Coupon</option>
                </select>
              </div>
              <div className="flex flex-col space-y-1 mb-[8px]">
                <span>Discount Title*</span>
                <input
                  type="text"
                  name="discount_name"
                  required
                  className="w-[100%] border-2 p-2 rounded-md outline-none"
                  value={inputs?.discount_name ?? ""}
                  onChange={handleInputs}
                  placeholder=""
                  onFocus={() => {
                    setIsNumericType(false);
                    handleInputFocus("discount_name");
                  }}
                  readOnly={os == "android" && isVisible == true ? true : false}
                />
              </div>
              <div className="sm:flex sm:space-x-2">
                <div className="flex flex-col space-y-1 mb-[8px] sm:w-[50%]">
                  <span>Amount Type*</span>
                  <select
                    onChange={handleInputs}
                    className="w-[100%] border-2 p-2 rounded-md outline-none"
                    name="discount_type"
                    value={inputs?.discount_type ?? ""}
                    disabled={operation == "update" && true}
                  >
                    <option value={1}>Percentage (%)</option>
                    <option value={2}>Amount</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1 mb-[8px]">
                  <span>Amount*</span>
                  <input
                    type="number"
                    name="discount"
                    required
                    className="w-[100%] border-2 p-2 rounded-md outline-none"
                    value={inputs?.discount ?? ""}
                    disabled={operation == "update" && true}
                    onChange={handleInputs}
                    placeholder=""
                    onFocus={() => {
                      setIsNumericType(true);
                      handleInputFocus("discount");
                    }}
                    readOnly={
                      os == "android" && isVisible == true ? true : false
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1 mb-[8px]">
                <span>Merchant*</span>
                <select
                  onChange={handleInputs}
                  className="w-[100%] border-2 p-2 rounded-md outline-none"
                  name="merchant_id"
                  value={inputs?.merchant_id ? inputs?.merchant_id : ""}
                  disabled={operation == "update" && true}
                >
                  <option value={""}>Select Merchant</option>
                  {merchants?.length > 0 ? (
                    <>
                      {merchants.map((item, index) => (
                        <option key={index} value={item?.merchant_id}>
                          {item?.merchant?.name ?? ""}
                        </option>
                      ))}
                    </>
                  ) : (
                    <></>
                  )}
                </select>
              </div>

              {inputs.is_for == "coupon" && (
                <div>
                  <div className="sm:flex sm:space-x-2">
                    <div className="flex flex-col space-y-1 mb-[8px] sm:w-[50%]">
                      <span>Select Status Online</span>
                      <select
                        onChange={handleInputs}
                        className="w-[100%] border-2 p-2 rounded-md outline-none"
                        name="select_type_for"
                        value={inputs?.select_type_for ?? ""}
                      >
                        <option value={1}>For Single</option>
                        <option value={0}>For Multiple</option>
                      </select>
                    </div>
                    <div className="flex flex-col space-y-1 mb-[8px]">
                      <span>Coupon Code</span>
                      <input
                        type="text"
                        name="coupin_code"
                        required={inputs.is_for == "coupon" && true}
                        className="w-[100%] border-2 p-2 rounded-md outline-none"
                        value={inputs?.coupin_code ?? ""}
                        onChange={handleInputs}
                        placeholder=""
                        disabled={operation == "update" && true}
                        onFocus={() => {
                          setIsNumericType(false);
                          handleInputFocus("coupin_code");
                        }}
                        readOnly={
                          os == "android" && isVisible == true ? true : false
                        }
                      />
                    </div>
                  </div>

                  <div className="sm:flex sm:space-x-2">
                    <div className="flex flex-col space-y-1 mb-[8px] sm:w-[48%]">
                      <span>Valid from</span>
                      <input
                        type="date"
                        required={inputs.is_for == "coupon" && true}
                        name="valid_from"
                        value={valid_from}
                        onChange={handleValid_from}
                        className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                      />
                    </div>
                    <div className="flex flex-col space-y-1 mb-[8px] sm:w-[48%]">
                      <span>Valid to</span>
                      <input
                        type="date"
                        required={inputs.is_for == "coupon" && true}
                        name="valid_to"
                        value={valid_to}
                        onChange={handleValid_to}
                        min={dateNow}
                        className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                      />
                    </div>
                  </div>

                  <div className="sm:flex sm:space-x-2">
                    <div className="flex flex-col space-y-1 mb-[8px] sm:w-[50%]">
                      <span>Usage Count</span>
                      <input
                        type="number"
                        name="usage_count"
                        required
                        className="w-[100%] border-2 p-2 rounded-md outline-none"
                        value={inputs?.usage_count ?? ""}
                        onChange={handleInputs}
                        placeholder=""
                        onFocus={() => {
                          setIsNumericType(true);
                          handleInputFocus("usage_count");
                        }}
                        readOnly={
                          os == "android" && isVisible == true ? true : false
                        }
                      />
                    </div>
                    <div className="flex flex-col space-y-1 mb-[8px]">
                      <span>Valid Order Amount</span>
                      <input
                        type="number"
                        name="valid_order_amount"
                        required
                        className="w-[100%] border-2 p-2 rounded-md outline-none"
                        value={inputs?.valid_order_amount ?? ""}
                        onChange={handleInputs}
                        placeholder=""
                        onFocus={() => {
                          setIsNumericType(true);
                          handleInputFocus("valid_order_amount");
                        }}
                        readOnly={
                          os == "android" && isVisible == true ? true : false
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1 mb-[8px]">
                    <span>Visable As Tag*</span>
                    <select
                      onChange={handleInputs}
                      name="tag_discount"
                      className="w-[100%] border-2 py-2 rounded-md outline-none"
                      defaultValue={inputs?.tag_discount}
                      value={inputs.tag_discount}
                    >
                      <option disabled>Select</option>
                      <option value={"active"}>Active</option>
                      <option value={"inactive"}>Disable</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-1 mb-[8px] w-fit">
                <span>Status*</span>
                <select
                  onChange={handleInputs}
                  name="status"
                  className="w-[100%] border-2 py-2 rounded-md outline-none"
                >
                  <option disabled>Status</option>
                  <option value={1}>Active</option>
                  <option value={2}>Disable</option>
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
        }
      </Modal>
    </>
  );
};

// main function
export default function Discounts() {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [selectedType, setSelectedType] = useState("discount");
  const [discountSearch, setDiscountSearch] = useState("");

  const getData = () => {
    getRequest(
      `/merchant/${merchant?.id}/discount?discountSearch=${discountSearch}&type=${selectedType}`
    ).then((res) => {
      setPageLevelLoader(false);
      setData(res?.data.discounts);
      setIsDataUpdated(false);
    });
  };

  const handleDelete = (id) => {
    setLoading(true);
    setSelectedId(id);
    postRequest(`/merchant/${merchant?.id}/discount/${id}`, { status: 3 })
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
  }, [user, merchant, discountSearch, selectedType]);

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
    <ProtectedRoute pageName={"discounts"}>
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
            <div className="w-[100%] border-b-2 text-[24px] py">Discounts</div>
            <div className="w-[100%] flex flex-col sm:flex-row items-end justify-between py-5 sm:items-center">
              <input
                onChange={(e) => {
                  setTimeout(() => {
                    setDiscountSearch(e.target.value);
                  }, 500);
                }}
                className="border p-3 sm:p-4 placeholder:text-[14px] sm:placeholder:text-[16px] w-full sm:w-[60%] md:w-[45%] rounded-[15px] bg-[#F8F8F8] outline-none"
                placeholder="Search..."
              />
              <select
                onChange={(e) => {
                  setSelectedType(e.target.value);
                }}
                className="border p-3 sm:p-4 placeholder:text-[14px] sm:placeholder:text-[16px] w-[50%] md:w-[30%] rounded-[15px] bg-[#F8F8F8] outline-none"
              >
                <option value={"discount"}>Discount</option>
                <option value={"coupon"}>Coupon</option>
              </select>

              <button
                onClick={() => {
                  handleModal({
                    heading: "Add Discount",
                    operation: "add",
                    getDataUrl: "",
                    postDataUrl: "discount",
                  });
                }}
                id="shadow"
                className="bg-white px-4 py-2 text-[14px] rounded-[10px] flex space-x-3 w-fit mt-2 sm:mt-0"
              >
                <img src="/images/Vector1.png" />
                <p>Add Discount</p>
              </button>
            </div>
            <div className="relative overflow-x-auto min-h-screen h-full overflow-y-hidden">
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-[#055938] text-[#ffffff]">
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Discount Title
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Merchants
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">Type</th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Discount
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Status
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Coupon Code
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Code status
                    </th>

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
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.discount_name}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.merchant?.name ?? "-"}
                          </td>

                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.discount_type == "by_percentage"
                              ? "Percentage (%) "
                              : "Amount"}
                          </td>

                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.discount ?? "-"}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.status === "active" ? (
                              <div className="bg-[#E2F6D9] text-[#055938] px-2 py-1 w-fit text-center rounded-[5px]">
                                Active
                              </div>
                            ) : item?.status === "disabled" ? (
                              <div className="bg-[#F7C8C8] text-[#EE3050] px-2 py-1 w-fit text-center rounded-[5px]">
                                Disabled
                              </div>
                            ) : (
                              <div className="bg-red-200 text-red-700 px-2 py-1 w-fit text-center rounded-[5px]">
                                Deleted
                              </div>
                            )}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.coupon_code ?? "-"}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.is_for_multiple == 1 ? "Single" : "Multiple"}
                          </td>

                          <td className=" px-7 py-2 lg:py-2 whitespace-nowrap">
                            <Actions
                              item={item}
                              navActions={[
                                {
                                  title: "Edit",
                                  func: () =>
                                    handleModal({
                                      heading: "Update Discount",
                                      operation: "update",
                                      getDataUrl: `discount/${item?.id}`,
                                      postDataUrl: `discount/${item?.id}`,
                                    }),
                                },
                                {
                                  title: "Delete",
                                  func: () => handleDelete(item?.id),
                                },
                              ]}
                            />
                          </td>
                          {/*
                          <td className=" px-7 py-2 lg:py-2 whitespace-nowrap">
                            <div className="p-4">
                              <div className="group relative">
                                <button>
                                  <BsThreeDots size={22} />
                                </button>
                                <nav
                                  tabIndex="0"
                                  className="border-2 bg-white invisible border-gray-800 rounded absolute right-5 -top-10 transition-all opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-1 z-10"
                                > */}
                          {/* <ul className="py-1"> */}
                          {/* <li>
                                    <button
                                      onClick={() => {
                                        handleModal({
                                          heading: "Update Team Member",
                                          operation: "update",
                                          getDataUrl: `employee/${item?.id}`,
                                          postDataUrl: `employee/${item?.id}`,
                                        });
                                      }}
                                      className="block px-4 py-2 hover:bg-gray-100 w-[100%]"
                                    >
                                      Edit
                                    </button>
                                  </li> */}

                          {/*
                                    <li>
                                       <button
                                      className="block px-4 py-2 hover:bg-gray-100 w-[100%]"
                                      onClick={() => {
                                        handleModal({
                                          heading: "Edit Discount",
                                          operation: "update",
                                          getDataUrl: `discount/${item?.id}`,
                                          postDataUrl: `discount/${item?.id}`,
                                        });
                                      }}
                                    >
                                      {selectedId == item?.id &&
                                        loading == true ? (
                                        <>
                                          <CSpinner />
                                        </>
                                      ) : (
                                        <>Edit</>
                                      )}
                                    </button> 
                                    </li>
                                    */}
                          {/* <li>
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
                                    </li> */}
                          {/* </ul> */}
                          {/* </nav>
                              </div>
                            </div>
                          </td> */}
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
