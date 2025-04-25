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
import Select from "react-select";
import ProtectedRoute from "@/components/protected-route";
import Actions from "@/components/ui/action";
import useCustomKeyboardProps from "@/components/ui/custom-keyboard-props";
import CustomKeyboard from "@/components/ui/custom-keyboard";

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

  const MANAGING_STEPS = {
    email: "find_email",
    profile_complete: "make_profile",
    role_select: "select_role",
  };

  const [steps, setSteps] = useState(
    operation == "update" ? MANAGING_STEPS.role_select : MANAGING_STEPS.email
  );

  const [alert, setAlert] = useState({ type: "danger", message: "" });
  const [loading, setLoading] = useState(false);

  const [roles, setRoles] = useState([]);
  const getRoles = () => {
    getRequest(`/roles`).then((res) => {
      setRoles(
        res?.data.map((cat) => ({
          label:
            cat.name == null
              ? cat.role
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")
              : cat.name,
          value: cat.id,
        }))
      );
    });
  };
  useEffect(() => {
    if (merchant !== null) {
      getRoles();
    }
  }, [merchant]);

  const initialState = {
    email: "",
    phone_no: "",
    role_id: "",
    password: "",
    merchant_id: "",
    fullname: "",
    address: "",
    zip_code: "",
    city: "",
    country: "",
    date_of_birth: "",
  };

  const [inputs, setInputs] = useState(initialState);

  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/${getDataUrl}`).then((res) => {
      setLoading(false);
      setInputs({
        fullname: res?.data?.fullname,
        email: res?.data?.email,
        phone_no: res?.data?.phone_no,
        address: res?.data?.address,
        zip_code: res?.data?.zip_code,
        city: res?.data?.city,
        country: res?.data?.country,
        date_of_birth: res?.data?.date_of_birth,
        role_id: res?.data?.role_id,
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

  const getButtonName = () => {
    if (steps == MANAGING_STEPS.email) {
      return "Continue";
    } else if (
      steps == MANAGING_STEPS.profile_complete ||
      steps == MANAGING_STEPS.role_select
    ) {
      return "Save";
    }
  };

  const verifyEmail = () => {
    setLoading(true);
    postRequest(`/merchant/${merchant?.id}/verify-email`, {
      email: inputs?.email,
    })
      .then((res) => {
        if (res?.data?.emailFound == true) {
          setSteps(MANAGING_STEPS.role_select);
        } else if (res?.data?.emailFound == false) {
          setSteps(MANAGING_STEPS.profile_complete);
        }
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
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

            {[
              MANAGING_STEPS.email,
              MANAGING_STEPS.profile_complete,
              MANAGING_STEPS.role_select,
            ].includes(steps) ? (
              <>
                <div className="flex flex-col space-y-1 mb-[8px]">
                  <span>Email*</span>
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
                    readOnly={
                      os == "android" && isVisible == true ? true : false
                    }
                  />
                </div>
              </>
            ) : null}

            {[MANAGING_STEPS.profile_complete].includes(steps) ? (
              <>
                <div className="flex flex-col space-y-1 mb-[8px]">
                  <span>Name*</span>
                  <input
                    type="text"
                    name="fullname"
                    className="w-[100%] border-2 p-2 rounded-md outline-none"
                    required
                    value={inputs?.fullname ?? ""}
                    onChange={handleInputs}
                    placeholder="Enter Team member fullname"
                    onFocus={() => {
                      setIsNumericType(false);
                      handleInputFocus("fullname");
                    }}
                    readOnly={
                      os == "android" && isVisible == true ? true : false
                    }
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
                    readOnly={
                      os == "android" && isVisible == true ? true : false
                    }
                  />
                </div>

                <div className="flex flex-col space-y-1 mb-[8px]">
                  <span>Password{operation == "add" ? "*" : ""}</span>
                  <input
                    type="text"
                    name="password"
                    className="w-[100%] border-2 p-2 rounded-md outline-none"
                    value={inputs?.password ?? ""}
                    onChange={handleInputs}
                    required={operation == "add" ? true : false}
                    placeholder="Enter Team member password"
                    onFocus={() => {
                      setIsNumericType(false);
                      handleInputFocus("password");
                    }}
                    readOnly={
                      os == "android" && isVisible == true ? true : false
                    }
                  />
                </div>
              </>
            ) : null}

            {[
              MANAGING_STEPS.role_select,
              MANAGING_STEPS.profile_complete,
            ].includes(steps) ? (
              <>
                <div className="flex flex-col py-3 space-y-1">
                  <span>Select Role*</span>
                  <Select
                    required={true}
                    name="role_id"
                    options={roles}
                    onChange={(option) => {
                      setInputs({ ...inputs, role_id: option?.value });
                    }}
                    defaultValue={roles.find(
                      (option) => option.value === inputs?.role_id
                    )}
                    placeholder="Select Role"
                    className="react-select-container" // You can customize the class for styling
                    classNamePrefix="react-select" // Prefix for inner classes
                    value={roles.find(
                      (option) => option.value === inputs?.role_id
                    )}
                  />
                </div>
              </>
            ) : null}

            <div className="flex justify-center space-x-4 w-[100%]">
              {steps == MANAGING_STEPS.email ? (
                <>
                  <button
                    onClick={() => {
                      verifyEmail();
                    }}
                    type="button"
                    className="w-[100px] px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                    disabled={loading == true ? loading : loading}
                  >
                    {loading == true ? <CSpinner /> : getButtonName()}
                  </button>
                </>
              ) : null}

              {steps == MANAGING_STEPS.profile_complete ||
              steps == MANAGING_STEPS.role_select ? (
                <>
                  <button
                    type="submit"
                    className="w-[100px] px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                    disabled={loading == true ? loading : loading}
                  >
                    {loading == true ? <CSpinner /> : getButtonName()}
                  </button>
                </>
              ) : null}

              {/* <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="border border-black w-[70px] px-3 py-2 rounded-[8px]"
              >
                Cancel
              </button> */}
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

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [searchUser, setSearchUser] = useState("");

  const getData = () => {
    getRequest(
      `/merchant/${merchant?.id}/manager?searchUser=${searchUser}`
    ).then((res) => {
      setPageLevelLoader(false);
      setData(res?.data);
      setIsDataUpdated(false);
    });
  };

  const handleDelete = (id) => {
    setLoading(true);
    setSelectedId(id);
    postRequest(`/merchant/${merchant?.id}/manager/${id}`, {}, "delete")
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
    if (merchant?.id !== undefined && user) getData();
  }, [user, merchant, searchUser]);

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
    <ProtectedRoute pageName={"manager"}>
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
              Manage Managers
            </div>
            <div className="w-[100%] flex flex-col md:flex-row items-end justify-between py-5 gap-4 md:items-center">
              <input
                onChange={(e) => {
                  setSearchUser(e.target.value);
                }}
                className="border p-3 sm:p-4 placeholder:text-[14px] sm:placeholder:text-[16px] w-[100%] md:w-[45%] rounded-[15px] bg-[#F8F8F8] outline-none"
                placeholder="Search..."
              />
              <button
                onClick={() => {
                  handleModal({
                    heading: "Add New Manager",
                    operation: "add",
                    getDataUrl: "",
                    postDataUrl: "manager",
                  });
                }}
                id="shadow"
                className="bg-white px-4 py-2 text-[14px] rounded-[10px] flex space-x-3"
              >
                <img src="/images/Vector1.png" />
                <p>Add New Team Manager</p>
              </button>
            </div>
            <div className="relative overflow-x-auto min-h-screen h-full overflow-y-hidden">
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-[#055938] text-[#ffffff]">
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Fullname
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">Email</th>
                    <th className="px-7 py-3 text-[18px] font-medium">Role</th>
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
                      {data?.map((item) => {
                        const role = item?.user_role?.role;
                        const role_name =
                          role.name == null
                            ? role.role
                                .split("_")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")
                            : role.name;
                        return (
                          <tr
                            key={item?.id}
                            className="border-b bg-white text-[14px]"
                          >
                            <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              {item?.profile?.fullname}
                            </td>
                            <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              {item?.email ?? "-"}
                            </td>
                            <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              {role_name}
                            </td>
                            <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              {item?.profile?.phone_no ?? "-"}
                            </td>
                            <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              <Actions
                                item={item}
                                navActions={[
                                  {
                                    title: "Edit",
                                    func: () =>
                                      handleModal({
                                        heading: "Update Manager",
                                        operation: "update",
                                        getDataUrl: `manager/${item?.id}`,
                                        postDataUrl: `manager/${item?.id}`,
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
                                              getDataUrl: `manager/${item?.id}`,
                                              postDataUrl: `manager/${item?.id}`,
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
