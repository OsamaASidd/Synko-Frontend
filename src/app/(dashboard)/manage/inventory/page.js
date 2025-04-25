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
import ManageStock from "./manage-stock";
import Activity from "./activity";
import ProtectedRoute from "@/components/protected-route";
import Actions from "@/components/ui/action";
import { inventory_type } from "@/utils/constants";

export default function Inventory() {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [modelIsOpen2, setIsModalOpen2] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [search, setSearch] = useState("");
  const getData = () => {
    let url;
    if (search) {
      url = `/merchant/${merchant?.id}/inventory?search=${search}`;
    } else {
      url = `/merchant/${merchant?.id}/inventory`;
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
    postRequest(`/merchant/${merchant?.id}/inventory/${id}`, {}, "delete")
      .then((res) => {
        getData();
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
        setSelectedId(0);
      });
  };

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

  const handleModal2 = (data) => {
    setIsModalOpen2(true);
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
    <ProtectedRoute pageName={"inventories"}>
      <div className="min-h-screen flex bg-[#171821]">
        <SideMenu />

        {modelIsOpen == true && currentModalData?.operation == "update" ? (
          <ManageStock
            modelIsOpen={modelIsOpen}
            setIsModalOpen={setIsModalOpen}
            heading={currentModalData?.heading}
            operation={currentModalData?.operation}
            getDataUrl={currentModalData?.getDataUrl}
            postDataUrl={currentModalData?.postDataUrl}
            setIsDataUpdated={setIsDataUpdated}
          />
        ) : (
          <ManageOperationModal
            modelIsOpen={modelIsOpen}
            setIsModalOpen={setIsModalOpen}
            heading={currentModalData?.heading}
            operation={currentModalData?.operation}
            getDataUrl={currentModalData?.getDataUrl}
            postDataUrl={currentModalData?.postDataUrl}
            setIsDataUpdated={setIsDataUpdated}
          />
        )}

        {modelIsOpen2 == true && (
          <Activity
            setIsModalOpen2={setIsModalOpen2}
            data={currentModalData}
            modelIsOpen2={modelIsOpen2}
          />
        )}

        <div className="w-[100%] xl:ml-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6 h-screen overflow-auto text-black bg-[#171821]">
          <div className="w-[100%] h-[calc(100vh-48px)] overflow-y-auto  bg-[#F8F8F8] rounded-[20px]  py-10 lg:p-10 px-3 md:px-8  lg:pr-16">
            <div className="w-[100%] border-b-2 text-[24px] py">
              Manage Inventory
            </div>
            <div className="w-[100%] flex flex-col sm:flex-row justify-between py-5 items-end sm:items-center">
              <input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                required
                className="border p-3 sm:p-4 placeholder:text-[14px] sm:placeholder:text-[16px] w-full sm:w-[60%] md:w-[45%] rounded-[15px] bg-[#F8F8F8] outline-none"
                placeholder="Search..."
              />
              <button
                onClick={() => {
                  handleModal({
                    heading: "Add Item",
                    operation: "add",
                    getDataUrl: "",
                    postDataUrl: "inventory",
                  });
                }}
                id="shadow"
                className="bg-white px-4 mt-2 sm:mt-0 py-2 text-[14px] rounded-[10px] flex space-x-3"
              >
                <img src="/images/Vector1.png" />
                <p>Add Item</p>
              </button>
            </div>
            <div className="relative overflow-x-auto min-h-screen h-full overflow-y-hidden">
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-[#055938] text-[#ffffff]">
                    <th className="px-7 py-3 text-[18px] font-medium">Item</th>
                    <th className="px-7 py-3 text-[18px] font-medium">SKU</th>
                    <th className="px-7 py-3 text-[18px] font-medium">Unit</th>
                    <th className="px-7 py-3 text-[18px] font-medium">Price</th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Quantity
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Inventory Type
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
                            {item?.sku}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap capitalize">
                            {item?.unit?.code == ""
                              ? "Per " + item?.unit?.name
                              : item?.unit?.code}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.inventory?.price ?? 0}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.available_quantity ?? 0}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap capitalize">
                            {item?.menu_item_ingredient?.menuItem
                              ?.inventory_type
                              ? item?.menu_item_ingredient?.menuItem
                                  ?.inventory_type == inventory_type.standalone
                                ? inventory_type.standalone
                                : inventory_type.recipe
                              : inventory_type.recipe}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            <Actions
                              item={item}
                              navActions={[
                                {
                                  title: "View Activity",
                                  func: () => handleModal2(item),
                                },
                                {
                                  title: "Manage Stock",
                                  func: () =>
                                    handleModal({
                                      heading: "Manage Stock",
                                      operation: "update",
                                      getDataUrl: `inventory/${item?.id}`,
                                      postDataUrl: `inventory/${item?.id}`,
                                    }),
                                },
                                {
                                  title:
                                    selectedId == item?.id &&
                                    loading == true ? (
                                      <CSpinner />
                                    ) : (
                                      "Delete"
                                    ),
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
                                  className="border-2 bg-white invisible border-gray-800 rounded absolute right-5 -top-20 transition-all opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-1 z-10"
                                >
                                  <ul className="py-1">
                                    <li>
                                      <button
                                        onClick={() => {
                                          handleModal2(item);
                                        }}
                                        className="block px-4 py-2 hover:bg-gray-100 w-[100%]"
                                      >
                                        View Activity
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        onClick={() => {
                                          handleModal({
                                            heading: "Manage Stock",
                                            operation: "update",
                                            getDataUrl: `inventory/${item?.id}`,
                                            postDataUrl: `inventory/${item?.id}`,
                                          });
                                        }}
                                        className="block px-4 py-2 hover:bg-gray-100 w-[100%]"
                                      >
                                        Manage Stock
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
