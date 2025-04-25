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
import { getErrorMessageFromResponse } from "@/utils/helper";
import Swal from "sweetalert2";
import ProtectedRoute from "@/components/protected-route";
import Actions from "@/components/ui/action";
import useHandleInputs from "@/hooks/useHandleInputs";
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

  const initialState = {
    name: "",
    position: "",
    status: 1,
  };

  const [inputs, handleInputs, setInputs] = useHandleInputs(initialState);

  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/${getDataUrl}`).then((res) => {
      setLoading(false);
      setInputs({
        name: res?.data?.data?.name,
        position: res?.data?.data?.position,
        status: res?.data?.data?.status,
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
        <form onSubmit={handleSubmit}>
          <div className="w-[100%] text-[14px] text-black">
            <div className="flex flex-col space-y-1">
              <span>Category Name*</span>
              <input
                type="text"
                name="name"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                required
                value={inputs?.name ?? ""}
                onChange={handleInputs}
                placeholder="Enter Category Name"
                onFocus={() => {
                  setIsNumericType(false);
                  handleInputFocus("name");
                }}
                readOnly={os == "android" && isVisible == true ? true : false}
              />
            </div>

            <div className="flex flex-col py-3 space-y-1">
              <span>Postion*</span>
              <input
                type="number"
                name="position"
                min={0}
                value={inputs?.position ?? ""}
                onChange={handleInputs}
                placeholder="Enter Position"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                required
                onFocus={() => {
                  setIsNumericType(true);
                  handleInputFocus("position");
                }}
                readOnly={os == "android" && isVisible == true ? true : false}
              />
            </div>

            <div className="flex flex-col py-3 space-y-1">
              <span>Select Visibility Status*</span>
              <select
                name="status"
                onChange={handleInputs}
                placeholder="Select Status"
                className="h-[40px] border-2 rounded-md px-[8px]"
                required
                value={inputs?.status}
              >
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
      </Modal>
    </>
  );
};

export default function Categories() {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [search, setSearch] = useState("");

  const getData = () => {
    let url;
    if (search) {
      url = `/merchant/${merchant?.id}/menus/category?search=${search}`;
    } else {
      url = `/merchant/${merchant?.id}/menus/category`;
    }

    getRequest(url).then((res) => {
      setPageLevelLoader(false);
      setData(res?.data);
      setIsDataUpdated(false);
    });
  };

  const handleDelete = (id) => {
    setLoading(true);
    setSelectedId(id);
    postRequest(`/merchant/${merchant?.id}/menus/category/${id}`, {}, "delete")
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
  }, [user, merchant, search]);
  const [openAction, setIsOpenAction] = useState(null);

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

        <div className=" w-[100%] xl:pl-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6  text-black bg-[#171821]">
          <div className=" px-4 md:px-10 rounded-lg py-12 bg-gray-50 h-[calc(100vh-48px)] overflow-y-auto w-[100%]">
            <div className="w-[100%] border-b-2 text-[24px] py-2">
              Manage Categories
            </div>
            <div className="w-[100%] flex flex-col md:flex-row items-end justify-between py-5 gap-4 md:items-center">
              <input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                required
                className="border p-3 sm:p-4 placeholder:text-[14px] sm:placeholder:text-[16px] w-[100%] md:w-[45%] rounded-[15px] bg-[#F8F8F8] outline-none"
                placeholder="Search by Category"
              />
              <button
                onClick={() => {
                  handleModal({
                    heading: "Add New Category",
                    operation: "add",
                    getDataUrl: "",
                    postDataUrl: "menus/category",
                  });
                }}
                id="shadow"
                className="bg-white px-4 py-2 text-[14px] rounded-[10px] flex space-x-3"
              >
                <img src="/images/Vector1.png" />
                <p>Add Category</p>
              </button>
            </div>
            <div className="relative pb-[60px]">
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-[#055938] text-[#ffffff]">
                    <th className="px-7 py-3 text-[18px] font-medium">Name</th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Position
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
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.position}
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
                                      heading: "Update Category",
                                      operation: "update",
                                      getDataUrl: `menus/category/${item?.id}`,
                                      postDataUrl: `menus/category/${item?.id}`,
                                    }),
                                },
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
                                  className="border-2 bg-white hidden border-gray-800 rounded absolute right-5 -top-10 transition-all opacity-0 group-focus-within:block group-focus-within:opacity-100 group-focus-within:translate-y-1 z-10"
                                >
                                  <ul className="py-1">
                                    <li>
                                      <button
                                        onClick={() => {
                                          handleModal({
                                            heading: "Update Category",
                                            operation: "update",
                                            getDataUrl: `menus/category/${item?.id}`,
                                            postDataUrl: `menus/category/${item?.id}`,
                                          });
                                        }}
                                        className="block px-4 py-2 hover:bg-gray-100 w-[100%]"
                                      >
                                        Edit
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        onClick={}
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
