"use client";
import React, { useContext, useEffect, useRef } from "react";
import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { GlobalContext } from "@/context";
import SideMenu from "@/components/menus/SideMenu";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { PulseLoader } from "react-spinners";
import Modal from "@/components/modal";
import CSpinner from "@/components/common/CSpinner";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { MdOutlineDeleteForever } from "react-icons/md";
import CAlert from "@/components/common/CAlert";
import { getErrorMessageFromResponse } from "@/utils/helper";
import Swal from "sweetalert2";
import ProtectedRoute from "@/components/protected-route";
import Actions from "@/components/ui/action";
import useDeviceVisibility from "@/hooks/useDeviceVisibility";
import CustomKeyboard from "@/components/ui/custom-keyboard";
import useCustomKeyboardProps from "@/components/ui/custom-keyboard-props";

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
  const modification_option = {
    name: "",
    extra_cost: "",
  };
  const initialState = {
    name: "",
    selection_type: 2,
    status: 1,
    is_excluded: 0,
    modification_options: [],
    is_custom_text: 0,
    text_type: 0,
  };

  const [inputs, setInputs] = useState(initialState);

  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/${getDataUrl}`).then((res) => {
      setLoading(false);
      setInputs({
        name: res?.data?.name,
        selection_type: res?.data?.selection_type,
        status: res?.data?.status,
        is_excluded: res?.data?.is_excluded,
        modification_options: res?.data?.modification_options,
        is_custom_text: res?.data?.is_custom_text,
        text_type: res?.data?.text_type,
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
    const { name, value, files } = event.target;
    if (name.startsWith("modification_options")) {
      // Handle variations separately
      const [, index, field] = name.match(/\[(\d+)\]\[(\w+)\]/);
      const variationIndex = parseInt(index, 10);

      setInputs((prev) => ({
        ...prev,
        modification_options: Array.isArray(prev.modification_options)
          ? prev.modification_options.map((modifier, i) => {
              if (i === variationIndex) {
                return {
                  ...modifier,
                  [field]: value,
                };
              }
              return modifier;
            })
          : [],
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
      }));
    }
  };

  const type = [
    { id: 1, name: "Single Selection" },
    { id: 2, name: "Multi Selection" },
    // { id: 3, name: "Multiset Selection " },
  ];

  const text_type_text = [
    {
      id: 0,
      name: "None",
    },
    {
      id: 1,
      name: "Percentage",
    },
    {
      id: 2,
      name: "Number",
    },
    {
      id: 3,
      name: "Text",
    },
  ];

  const modification_input = (count) => {
    const extra_cost =
      inputs?.modification_options[count]?.extra_cost ??
      inputs?.modification_options[count]?.ModificationOptionPrice?.extra_cost;
    return (
      <div key={count} className="grid grid-cols-3">
        <input
          type="text"
          name={`modification_options[${count}][name]`}
          value={inputs?.modification_options[count]?.name ?? ""}
          onChange={handleInputs}
          placeholder="Cheese"
          className="w-[100%] border-b-2 p-2 outline-none"
        />
        <input
          type="number"
          name={`modification_options[${count}][extra_cost]`}
          step={0.01}
          min={0}
          value={extra_cost}
          onChange={handleInputs}
          placeholder={"Price"}
          className="w-[100%] border-l-2 border-b-2 p-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => {
            if (inputs?.modification_options[count]?.id) {
              setInputs((prevInputs) => {
                // Ensure modification_options is an array and clone it
                const newModificationOptions = Array.isArray(
                  prevInputs.modification_options
                )
                  ? [...prevInputs.modification_options]
                  : [];

                // Check if the item at index 'count' exists
                if (newModificationOptions[count]) {
                  // Update the 'is_deleted' property of the specific item
                  newModificationOptions[count] = {
                    ...newModificationOptions[count],
                    is_deleted:
                      !inputs?.modification_options[count]?.is_deleted,
                  };
                }

                // Return the new state with the updated modification_options array
                return {
                  ...prevInputs,
                  modification_options: newModificationOptions,
                };
              });
            } else {
              setInputs((prev) => ({
                ...prev,
                modification_options: prev.modification_options.filter(
                  (_, i) => i !== count
                ),
              }));
            }
          }}
          className="w-[100%] border-l-2 border-b-2 p-2 outline-none flex justify-center items-center"
        >
          {inputs?.modification_options[count]?.is_deleted &&
          inputs?.modification_options[count]?.is_deleted == true ? (
            <>
              <MdOutlineDeleteForever size={20} className="text-[red]" />
            </>
          ) : (
            <>
              <IoMdCloseCircleOutline size={20} />
            </>
          )}
        </button>
      </div>
    );
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
    <ProtectedRoute pageName={"item_modifiers"}>
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
                <span>
                  Modifier set name<span className="text-[red]">*</span>
                </span>
                <input
                  type="text"
                  name="name"
                  className="w-[100%] border-2 p-2 rounded-md outline-none"
                  required
                  value={inputs?.name ?? ""}
                  onChange={handleInputs}
                  placeholder="Enter Modifier set name"
                  onFocus={() => {
                    setIsNumericType(false);
                    handleInputFocus("name");
                  }}
                  readOnly={os == "android" && isVisible == true ? true : false}
                />
              </div>

              <div className="flex flex-col py-3 space-y-1">
                <h3 className="font-[700] text-[15px]">Modifier options</h3>
                <p className="text-justify text-[12px]">
                  Enhance customer engagement by offering customizable modifier
                  options for your items. Allow patrons to personalize their
                  orders with add-ons, substitutions, and special requests,
                  creating a tailored dining experience that meets individual
                  tastes and needs.
                </p>
              </div>

              {inputs?.modification_options?.length > 0 ? (
                <>
                  <div className="flex flex-col pb-3 space-y-1">
                    <div className="grid grid-cols-3 gap-4 font-[600] text-[14px] border-b-2">
                      <span>Modifier</span>
                      <span>Price</span>
                    </div>
                    <div>
                      {inputs?.modification_options?.map((res, index) =>
                        modification_input(index)
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
              <button
                type="button"
                onClick={() => {
                  setInputs({
                    ...inputs,
                    modification_options: [
                      ...inputs.modification_options,
                      modification_option,
                    ],
                  });
                }}
                className="border border-black w-full px-3 py-2 rounded-[8px] mb-[10px]"
              >
                Add Modifier
              </button>

              <div className="flex flex-col py-3 space-y-1">
                <h3 className="font-[700] text-[15px]">Settings</h3>
              </div>

              <hr />

              <div className="flex justify-between my-[12px]">
                <div>
                  <h5>Customer can only select one modifier</h5>
                  <p className="text-[10px]">
                    By default, customer can select multiple modifiers
                  </p>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={() => {
                        setInputs({
                          ...inputs,
                          selection_type: inputs?.selection_type == 2 ? 1 : 2,
                        });
                      }}
                      name="selection_type"
                      checked={inputs?.selection_type == 1 ? true : false}
                      value="1"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7DE143]"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between my-[12px] items-center">
                <div>
                  <h5>Is this modifier for excluded</h5>
                  <p className="text-[10px]">
                    By default, this modifier is set to {"'included'"}
                  </p>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={() => {
                        setInputs({
                          ...inputs,
                          is_excluded: inputs?.is_excluded == 1 ? 0 : 1,
                        });
                      }}
                      name="selection_type"
                      checked={inputs?.is_excluded == 1 ? true : false}
                      value="1"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7DE143]"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between my-[12px] items-center">
                <div>
                  <h5>Custom field</h5>
                  <p className="text-[10px]">
                    Add custom field to add additional info to your modifier.
                  </p>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={() => {
                        setInputs({
                          ...inputs,
                          is_custom_text: inputs?.is_custom_text == 1 ? 0 : 1,
                        });
                      }}
                      name="is_custom_text"
                      checked={inputs?.is_custom_text == 1 ? true : false}
                      value="1"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7DE143]"></div>
                  </label>
                </div>
              </div>

              {inputs?.is_custom_text == 1 && (
                <div className="flex flex-col py-3 space-y-1">
                  <span>
                    Field Type<span className="text-[red]">*</span>
                  </span>
                  <select
                    name="text_type"
                    onChange={handleInputs}
                    placeholder="Text Type*"
                    className="h-[40px] border-2 rounded-md px-[8px]"
                    value={inputs?.text_type}
                  >
                    {text_type_text && text_type_text.length ? (
                      <>
                        {text_type_text?.map((item, index) => (
                          <option key={index} value={item?.id}>
                            {item.name}
                          </option>
                        ))}
                      </>
                    ) : null}
                  </select>
                </div>
              )}

              <div className="flex justify-between my-[12px] items-center">
                <div>
                  <h5>
                    Status<span className="text-[red]">*</span>
                  </h5>
                  <p className="text-[10px]">
                    Switch to enable or disable the Modifier.
                  </p>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={() => {
                        setInputs({
                          ...inputs,
                          status: inputs?.status == 1 ? 0 : 1,
                        });
                      }}
                      name="status"
                      checked={inputs?.status == 1 ? true : false}
                      value="1"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7DE143]"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-center space-x-4 w-[100%] mt-[30px]">
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
    </ProtectedRoute>
  );
};

export default function Modifiers() {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const getData = () => {
    getRequest(
      `/merchant/${merchant?.id}/menus/modification_category?searchValue=${searchValue}`
    ).then((res) => {
      setData(res?.data);
      setIsDataUpdated(false);
    });
  };

  const handleDelete = (id) => {
    setLoading(true);
    setSelectedId(id);
    postRequest(
      `/merchant/${merchant?.id}/menus/modification_category/${id}`,
      {},
      "delete"
    )
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
  }, [user, merchant, searchValue]);

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

  return (
    <ProtectedRoute pageName={"menu-items"}>
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

        <div className="w-[100%] xl:ml-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6 h-screen overflow-auto text-black bg-[#171821]">
          <div className="w-[100%] h-[calc(100vh-48px)] overflow-y-auto bg-[#F8F8F8] rounded-[20px]  py-10 lg:p-10 px-3 md:px-8  lg:pr-16">
            <div className="w-[100%] border-b-2 text-[24px] py">
              Manage Modifiers
            </div>
            <div className="w-[100%]  flex flex-col md:flex-row items-end justify-between py-5 gap-4 md:items-center">
              <input
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
                className="border p-3 sm:p-4 placeholder:text-[14px] sm:placeholder:text-[16px] w-full sm:w-[60%] md:w-[45%] rounded-[15px] bg-[#F8F8F8] outline-none"
                placeholder="Search..."
              />
              <button
                onClick={() => {
                  handleModal({
                    heading: "Create a modifier",
                    operation: "add",
                    getDataUrl: "",
                    postDataUrl: "menus/modification_category",
                  });
                }}
                id="shadow"
                className="bg-white px-4 py-2 text-[14px] rounded-[10px] flex space-x-3"
              >
                <img src="/images/Vector1.png" />
                <p>Create a modifier</p>
              </button>
            </div>
            <div className="relative pb-[60px]">
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-[#055938] text-[#ffffff]">
                    <th className="px-7 py-3 text-[18px] font-medium">Name</th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Details
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Include/Exclude
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
                      {data?.map((item) => (
                        <tr
                          key={item?.id}
                          className="border-b bg-white text-[14px]"
                        >
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.name}
                          </td>
                          <td className="px-7 py-2 lg:py-2 max-[900px]:h-[80px] max-[900px]:w-[200px] overflow-x-auto max-[900px]:whitespace-nowrap overflow-ellipsis max-h-[3rem] line-clamp-3">
                            {item?.modification_options &&
                            item?.modification_options?.length > 0 ? (
                              <>
                                {item?.modification_options?.map(
                                  (item) => item?.name + ", "
                                )}
                              </>
                            ) : (
                              <>No Options</>
                            )}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.is_excluded == 1 ? (
                              <div className="bg-red-100 text-red-500 px-2 py-1 w-fit text-center rounded-[5px]">
                                Exclude
                              </div>
                            ) : (
                              <div className="bg-green-100 text-green-500 px-2 py-1 w-fit text-center rounded-[5px]">
                                Include
                              </div>
                            )}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.status == 1 ? (
                              <div className="bg-green-100 text-green-500 px-2 py-1 w-fit text-center rounded-[5px]">
                                Active
                              </div>
                            ) : (
                              <div className="bg-red-100 text-red-500 px-2 py-1 w-fit text-center rounded-[5px]">
                                Disabled
                              </div>
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
                                      heading: "Update Modifier",
                                      operation: "update",
                                      getDataUrl: `menus/modification_category/${item?.id}`,
                                      postDataUrl: `menus/modification_category/${item?.id}`,
                                    }),
                                },
                                {
                                  title: "Delete",
                                  func: () => handleDelete(item?.id),
                                },
                              ]}
                            />
                          </td>
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
