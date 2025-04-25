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

  const initialState = {
    name: "",
    email: "",
    phone_no: "",
    passcode: "",
  };

  const [inputs, setInputs] = useState(initialState);

  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/${getDataUrl}`).then((res) => {
      setLoading(false);
      setInputs({
        name: res?.data?.name,
        email: res?.data?.email,
        phone_no: res?.data?.phone_no,
        passcode: res?.data?.passcode,
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
    if (event.target.name == "passcode") {
      if (event.target.value.length > 4) {
        return;
      }
      setInputs((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
      }));
    }
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
        <form onSubmit={handleSubmit}>
          <div className="w-[100%] text-[14px] text-black">
            {alert.message && (
              <CAlert color={alert.type}>{alert.message}</CAlert>
            )}
            <div className="flex flex-col space-y-1 mb-[8px]">
              <span>Name*</span>
              <input
                type="text"
                name="name"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                required
                value={inputs?.name ?? ""}
                onChange={handleInputs}
                placeholder="Enter Team member name"
                onFocus={() => {
                  setIsNumericType(false);
                  handleInputFocus("name");
                }}
                readOnly={os == "android" && isVisible == true ? true : false}
              />
            </div>

            <div className="flex flex-col space-y-1 mb-[8px]">
              <span>Email</span>
              <input
                type="email"
                name="email"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                value={inputs?.email ?? ""}
                onChange={handleInputs}
                placeholder="Enter Team member email"
                onFocus={() => {
                  setIsNumericType(false);
                  handleInputFocus("email");
                }}
                readOnly={os == "android" && isVisible == true ? true : false}
              />
            </div>

            <div className="flex flex-col space-y-1 mb-[8px]">
              <span>Phone no</span>
              <input
                type="number"
                name="phone_no"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                value={inputs?.phone_no ?? ""}
                onChange={handleInputs}
                placeholder="Enter Team member phone no"
                onFocus={() => {
                  setIsNumericType(true);
                  handleInputFocus("phone_no");
                }}
                readOnly={os == "android" && isVisible == true ? true : false}
              />
            </div>

            <div className="flex flex-col space-y-1 mb-[8px]">
              <span>Passcode*</span>
              <input
                type="number"
                name="passcode"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                value={inputs?.passcode ?? ""}
                onChange={handleInputs}
                required
                placeholder="1241"
                onFocus={() => {
                  setKeyboardShow(false);
                }}
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

export default function Teams() {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);
  const [searchEmployee, setSearchEmployee] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);

  const getData = () => {
    getRequest(
      `/merchant/${merchant?.id}/employee?searchEmployee=${searchEmployee}`
    ).then((res) => {
      setPageLevelLoader(false);
      setData(res?.data);
      setIsDataUpdated(false);
    });
  };

  const handleDelete = (id) => {
    setLoading(true);
    setSelectedId(id);
    postRequest(`/merchant/${merchant?.id}/employee/${id}`, {}, "delete")
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
  }, [user, merchant, searchEmployee]);

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
    <ProtectedRoute pageName={"teams"}>
      <div className="min-h-screen flex bg-[#171821] ">
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
              Manage Teams
            </div>
            <div className="w-[100%] flex flex-col md:flex-row items-end justify-between py-5 gap-4 md:items-center">
              <input
                className="border p-3 sm:p-4 placeholder:text-[14px] sm:placeholder:text-[16px] w-full sm:w-[60%] md:w-[45%] rounded-[15px] bg-[#F8F8F8] outline-none"
                placeholder="Search..."
                onChange={(e) => {
                  setSearchEmployee(e.target.value);
                }}
              />
              <button
                onClick={() => {
                  handleModal({
                    heading: "Add New Team Member",
                    operation: "add",
                    getDataUrl: "",
                    postDataUrl: "employee",
                  });
                }}
                id="shadow"
                className="bg-white px-4 py-2 text-[14px] rounded-[10px] flex space-x-3"
              >
                <img src="/images/Vector1.png" />
                <p>Add New Team Member</p>
              </button>
            </div>
            <div className="relative overflow-x-auto min-h-screen h-full overflow-y-hidden">
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-[#055938] text-[#ffffff]">
                    <th className="px-7 py-3 text-[18px] font-medium">Name</th>
                    <th className="px-7 py-3 text-[18px] font-medium">Email</th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Phone No
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
                            {item?.email ?? "-"}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.phone_no ?? "-"}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            <Actions
                              item={item}
                              navActions={[
                                {
                                  title: "Edit",
                                  func: () =>
                                    handleModal({
                                      heading: "Update Team Member",
                                      operation: "update",
                                      getDataUrl: `employee/${item?.id}`,
                                      postDataUrl: `employee/${item?.id}`,
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
                                  className="border-2 bg-white invisible border-gray-800 rounded absolute right-5 -top-10 transition-all opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-1 z-10"
                                >
                                  <ul className="py-1">
                                    <li>
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
