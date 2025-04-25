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
import ManageOperationModal from "./operation";
import ManageApp from "./manage-app";
import Activity from "./activity";
import ProtectedRoute from "@/components/protected-route";
import { app_integrations } from "@/utils/constants";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import Actions from "@/components/ui/action";
import { create } from "@mui/material/styles/createTransitions";

export default function MyApplicaitons() {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [modelIsOpen2, setIsModalOpen2] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [search, setSearch] = useState("");

  // Function to swap two rows by their indexes
  const swapRows = (arr, i, j) => {
    // Make a shallow copy of the array so the original isn't modified
    const newArr = [...arr];

    if (
      i >= 0 &&
      j >= 0 &&
      i < newArr?.length &&
      j < newArr?.length &&
      i !== j
    ) {
      const temp = newArr[i];
      newArr[i] = newArr[j];
      newArr[j] = temp;
      return newArr;
    }

    // Return the new array with swapped rows
    return newArr;
  };

  const getData = () => {
    let url;
    if (search) {
      url = `/merchant/${merchant?.id}/my-apps?search=${search}`;
    } else {
      url = `/merchant/${merchant?.id}/my-apps`;
    }
    getRequest(url).then((res) => {
      setPageLevelLoader(false);

      // setData(res?.data);
      const ddata = res?.data;
      const index1 = ddata.findIndex(
        (item) => item.name === app_integrations.viva.id
      );
      const index2 = ddata.findIndex(
        (item) => item.name === app_integrations.viva_direct.id
      );
      const newData = swapRows(ddata, index1, index2);
      const tempData = [
        ...newData,
        {
          id: 5,
          name: "MYPOS",
          app_type: "payment_terminals",
          created_at: "2024-11-28T14:22:38.000+05:00",
          updated_at: "2024-11-28T14:22:38.000+05:00",
          merchant_app: null,
        },
      ];
      setData(tempData);
      setIsDataUpdated(false);
    });
  };

  const handleDelete = (id) => {
    setLoading(true);
    setSelectedId(id);
    postRequest(`/merchant/${merchant?.id}/my-apps/${id}`, {}, "delete")
      .then((res) => {
        getData();
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
        setSelectedId(0);
      });
  };

  const [selectedRow, setSelectedRow] = useState(null);
  const handleVerifyStatus = (id) => {
    setSelectedRow(id);
    setLoading(true);
    postRequest(`/merchant/${merchant?.id}/verify-viva-status/${id}`)
      .then((res) => {
        getData();
      })
      .catch((err) => {
        getErrorMessageFromResponse(err);
      })
      .finally(() => {
        setSelectedRow(null);
        setLoading(false);
      });
  };
  // useEffect(() => {
  //   //this is temporary data insertion for testing
  //   setData([
  //     ...data,
  //     {
  //       id: 5,
  //       name: "MYPOS",
  //       app_type: "payment_terminalsy",
  //       created_at: "2024-11-28T14:22:38.000+05:00",
  //       updated_at: "2024-11-28T14:22:38.000+05:00",
  //       merchant_app: null,
  //     },
  //   ]);
  // }, []);

  useEffect(() => {
    if (merchant.id !== undefined && user) getData();
  }, [user, merchant, search]);

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

  const handleMYPOS = () => {
    Swal.fire({
      text: "This will be activated soon",
      icon: "success",
    });
  };

  const handleModal2 = (data) => {
    setIsModalOpen2(true);
    setCurrentModalData(data);
  };

  const isUpdateOne = (item) => {
    if (
      item?.name == app_integrations.paymentree.id ||
      item?.name == app_integrations.viva_direct.id ||
      item?.name == app_integrations?.viva.id ||
      item?.name == app_integrations?.apax_terminals.id
    ) {
      return true;
    }
    return false;
  };

  const [openViva, setOpenViva] = useState(false);
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

  console.log(data, "<----DATAss");
  return (
    <ProtectedRoute pageName={"settings"}>
      <div className="min-h-screen flex bg-[#171821]">
        <SideMenu />

        {modelIsOpen == true && (
          <ManageApp
            modelIsOpen={modelIsOpen}
            setIsModalOpen={setIsModalOpen}
            heading={currentModalData?.heading}
            operation={currentModalData?.operation}
            postDataUrl={currentModalData?.postDataUrl}
            setIsDataUpdated={setIsDataUpdated}
            data={currentModalData?.data}
          />
        )}

        <div className="w-[100%] xl:ml-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6 h-screen overflow-auto text-black bg-[#171821]">
          <div className="w-[100%] h-[calc(100vh-48px)] overflow-y-auto bg-[#F8F8F8] rounded-[20px]  py-10 lg:p-10 px-3 md:px-8  lg:pr-16">
            <div className="w-[100%] border-b-2 text-[24px] py-2 mt-5">
              App Integrations
            </div>
            <div className="relative overflow-x-auto min-h-screen h-full overflow-y-hidden mt-[20px]">
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-[#055938] text-[#ffffff]">
                    <th className="px-7 py-3 text-[18px] font-medium">Name</th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      App Type
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Status
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      App Status
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
                        return (
                          <tr
                            key={item?.id}
                            className={`${
                              item?.name == app_integrations.viva.id &&
                              openViva == false
                                ? "hidden"
                                : ""
                            } border-b bg-white text-[14px]`}
                          >
                            <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              {item?.name == app_integrations.viva_direct.id ? (
                                <>
                                  {openViva == true ? (
                                    <button
                                      onClick={() => {
                                        setOpenViva(false);
                                      }}
                                    >
                                      <IoIosArrowUp />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setOpenViva(true);
                                      }}
                                    >
                                      <IoIosArrowDown />
                                    </button>
                                  )}
                                </>
                              ) : (
                                ""
                              )}
                              {item?.name}
                            </td>
                            <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              {item?.app_type}
                            </td>
                            <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              {item?.merchant_app?.is_active == true
                                ? "Enabled"
                                : "Disabled"}
                            </td>
                            <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              {item?.merchant_app?.status == true
                                ? "Active"
                                : "Inactive"}
                            </td>
                            <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                              <Actions
                                item={item}
                                navActions={[
                                  {
                                    title: item?.merchant_app?.id
                                      ? item?.merchant_app?.is_active == true
                                        ? "Disable"
                                        : "Enable"
                                      : "Install",
                                    func: () =>
                                      item?.merchant_app?.id
                                        ? handleDelete(item?.merchant_app?.id)
                                        : item?.name == "MYPOS"
                                        ? handleMYPOS()
                                        : handleModal({
                                            heading: "Manage App Config",
                                            operation: "add",
                                            postDataUrl: `my-apps`,
                                            data: item,
                                          }),
                                  },
                                  ...(item?.merchant_app?.id &&
                                  isUpdateOne(item)
                                    ? [
                                        {
                                          title: "Edit Config",
                                          func: () =>
                                            handleModal({
                                              heading: "Manage App Config",
                                              operation: "update",
                                              postDataUrl: `my-apps`,
                                              data: item,
                                            }),
                                        },
                                        item?.name ==
                                          app_integrations.viva.id && {
                                          title:
                                            selectedRow ===
                                              item?.merchant_app?.id &&
                                            loading === true ? (
                                              <CSpinner />
                                            ) : (
                                              "Verify App Status"
                                            ),
                                          func: () =>
                                            handleVerifyStatus(
                                              item?.merchant_app?.id
                                            ),
                                        },
                                      ]
                                    : []),
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
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
