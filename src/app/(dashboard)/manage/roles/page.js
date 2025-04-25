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
import Toggle from "rsuite/Toggle";
import "rsuite/Toggle/styles/index.css";
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

  const [rolePermissions, setRolePermissions] = useState([]);
  const getPermissions = () => {
    getRequest(`/permissions/roles`).then((res) => {
      setRolePermissions(res?.data);
    });
  };

  useEffect(() => {
    if (merchant !== null) {
      getPermissions();
    }
  }, [merchant]);

  const initialState = {
    name: "",
    role_permissions: [],
    merchant_id: merchant?.id,
  };

  const [inputs, setInputs] = useState(initialState);

  const getData = () => {
    setLoading(true);
    getRequest(`/${getDataUrl}`).then((res) => {
      const data = res?.data;
      setLoading(false);
      setInputs({
        name:
          data.name == null
            ? data.role
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
            : data.name,
        role_permissions:
          data?.role_permissions?.map((item) => item.default_permission_id) ||
          [],
        merchant_id: merchant?.id,
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
    postRequest(`/${url}`, inputs, operation == "update" ? "put" : "post")
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
              <span>Name*</span>
              <input
                type="text"
                name="name"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                required
                value={inputs?.name || ""}
                onChange={handleInputs}
                placeholder="Enter Team member name"
              />
            </div>

            <div className="flex flex-col space-y-[10px] mb-[8px]">
              <div>Permissions*</div>
              {rolePermissions?.length > 0 ? (
                <>
                  <div className="flex flex-col gap-y-[8px]">
                    {rolePermissions.map((item, index) => {
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="capitalize">{item.permission}</span>{" "}
                          <Toggle
                            defaultChecked={false}
                            checked={inputs.role_permissions.some(
                              (val) => val == item?.id
                            )}
                            onChange={(e) => {
                              const permissions = inputs?.role_permissions;
                              const index = permissions.indexOf(item?.id);
                              const isAdd = e;
                              if (isAdd == true) {
                                if (index !== -1) {
                                  permissions.splice(index, 1);
                                }
                                permissions.push(item?.id);
                              } else {
                                if (index !== -1) {
                                  permissions.splice(index, 1);
                                }
                              }
                              setInputs({
                                ...inputs,
                                role_permissions: permissions,
                              });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <></>
              )}
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

export default function Roles() {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [searchUser, setSearchUser] = useState("");

  const getData = () => {
    getRequest(`/roles`).then((res) => {
      setPageLevelLoader(false);
      setData(res?.data);
      setIsDataUpdated(false);
    });
  };

  const handleDelete = (id) => {
    setLoading(true);
    setSelectedId(id);
    postRequest(`/roles/${id}`, {}, "delete")
      .then((res) => {
        getData();
      })
      .catch((err) => {
        getErrorMessageFromResponse(err);
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
    <ProtectedRoute pageName={"settings"}>
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
          <div className=" px-4 md:px-10 h-[calc(100vh-48px)] overflow-y-auto rounded-lg py-12 bg-gray-50 w-[100%]">
            <div className="w-[100%] border-b-2 text-[24px] py">
              Manage Roles
            </div>
            <div className="w-[100%] flex flex-col sm:flex-row justify-between py-5 gap-4 items-end sm:items-center">
              <input
                onChange={(e) => {
                  setSearchUser(e.target.value);
                }}
                className="border p-3 sm:p-4 placeholder:text-[14px] sm:placeholder:text-[16px] w-full sm:w-[60%] md:w-[45%] rounded-[15px] bg-[#F8F8F8] outline-none"
                placeholder="Search..."
              />
              <button
                onClick={() => {
                  handleModal({
                    heading: "Add New Role",
                    operation: "add",
                    getDataUrl: "",
                    postDataUrl: "roles",
                  });
                }}
                id="shadow"
                className="bg-white px-4 py-2 text-[14px] rounded-[10px] flex space-x-3"
              >
                <img src="/images/Vector1.png" />
                <p>Add New Role</p>
              </button>
            </div>
            <div className="relative overflow-x-auto min-h-screen h-full overflow-y-hidden">
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-[#055938] text-[#ffffff]">
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Role ID
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Role Name
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data && data.length > 0 ? (
                    <>
                      {data?.map((item, index) => (
                        <tr
                          key={item?.id}
                          className="border-b bg-white text-[14px]"
                        >
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {index + 1}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item.name == null
                              ? item.role
                                  .split("_")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(" ")
                              : item.name}
                          </td>
                          <td className="px-7 py-2 whitespace-nowrap">
                            <div className="p-4">
                              <div className="group relative">
                                <button>
                                  <BsThreeDots size={22} />
                                </button>
                                <nav
                                  tabIndex="0"
                                  className="border-2 bg-white invisible border-gray-800 rounded absolute left-8 -top-8 transition-all opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-1 z-10"
                                >
                                  <ul className="py-1">
                                    <li>
                                      <button
                                        onClick={() => {
                                          handleModal({
                                            heading: "Update Role",
                                            operation: "update",
                                            getDataUrl: `roles/${item?.id}`,
                                            postDataUrl: `roles/${item?.id}`,
                                          });
                                        }}
                                        className="block px-4 py-2 hover:bg-gray-100 w-[100%]"
                                      >
                                        Edit
                                      </button>
                                    </li>
                                    {![
                                      "store_manager",
                                      "shift_manager",
                                      "cashier",
                                      "owner",
                                    ].includes(item.role) ? (
                                      <>
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
                                      </>
                                    ) : (
                                      <></>
                                    )}
                                  </ul>
                                </nav>
                              </div>
                            </div>
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
