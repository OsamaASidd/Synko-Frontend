"use client";
import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { GlobalContext } from "@/context";
import SideMenu from "@/components/menus/SideMenu";
import { getRequest } from "@/utils/apiFunctions";
import { PulseLoader } from "react-spinners";
import CSpinner from "@/components/common/CSpinner";
import ProtectedRoute from "@/components/protected-route";
import Paginate from "@/components/paginate";
import { FaSearch } from "react-icons/fa";
import CreateCustomer from "../newsale/create-customer";
import CreateCustomerModal from "@/components/customers/CreateCustomerModal";

export default function Customers() {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const [modalIsOpen, setIsModalOpen] = useState(false);
  const [customer, setCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [searchCustomer, setSearchCustomer] = useState("");

  const [pageCurrent, setPageCurrent] = useState(1);
  const [metaData, setMetaData] = useState();
  const getData = () => {
    let url;
    if (searchCustomer) {
      url = `/merchant/${merchant?.id}/get_customers?search=${searchCustomer}&&page=${pageCurrent}`;
    } else {
      url = `/merchant/${merchant?.id}/get_customers?page=${pageCurrent}`;
    }
    getRequest(url).then((res) => {
      setPageLevelLoader(false);
      setData(res?.data.data);
      setMetaData(res?.data?.meta);
      setIsDataUpdated(false);
    });
  };

  const handleDelete = (id) => {
    // setLoading(true);
    // setSelectedId(id);
    // postRequest(`/merchant/${merchant?.id}/device/${id}`, {}, "delete")
    //   .then((res) => {
    //     getData();
    //   })
    //   .catch((err) => {
    //     if (err?.response?.data?.messages) {
    //       for (const [key, value] of Object.entries(
    //         err.response.data.messages
    //       )) {
    //         alert(value[0]);
    //       }
    //     } else {
    //       alert(err?.response?.data?.message);
    //     }
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //     setSelectedId(0);
    //   });
  };

  useEffect(() => {
    if (merchant.id !== undefined && user) getData();
  }, [user, merchant, pageCurrent, searchCustomer, modalIsOpen]);

  const [dataUpdated, setIsDataUpdated] = useState(null);
  useEffect(() => {
    if (dataUpdated == true) {
      getData();
    }
  }, [dataUpdated]);

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
  const handleSearch = (e) => {
    e.preventDefault();
    if (merchant.id !== undefined && user) {
      getData();
    }
  };

  return (
    <ProtectedRoute pageName={"devices"}>
      {modalIsOpen && (
        <CreateCustomerModal
          modalIsOpen={modalIsOpen}
          setIsModalOpen={setIsModalOpen}
          setSelectedCustomer={setSelectedCustomer}
          setCustomer={setCustomer}
        />
      )}
      <div className="min-h-screen flex bg-[#171821]">
        <SideMenu />
        <div className=" w-[100%] xl:pl-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6  text-black bg-[#171821]">
          <div className=" px-4 md:px-10 rounded-lg py-12 bg-gray-50 h-[calc(100vh-48px)] overflow-y-auto w-[100%]">
            <div className="w-[100%] border-b-2 text-[24px] py">
              Manage Customers
            </div>
            <div className="w-[100%] flex justify-between py-5 items-center">
              <form onSubmit={handleSearch} className="flex w-full sm:gap-2">
                <input
                  onChange={(e) => {
                    setSearchCustomer(e.target.value);
                  }}
                  className="border p-3 sm:p-4 placeholder:text-[14px] sm:placeholder:text-[16px] w-full sm:w-[60%] md:w-[45%] rounded-[15px] bg-[#F8F8F8] outline-none"
                  placeholder="Search..."
                />
                <button
                  type="submit"
                  className=" px-6 ml-2 sm:ml-0 py-3 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                  disabled={loading == true ? loading : loading}
                >
                  {loading == true ? (
                    <CSpinner />
                  ) : (
                    <>
                      {/* <p className="hidden sm:">Search</p> */}
                      <FaSearch className="" />
                    </>
                  )}
                </button>
              </form>
              <button
                onClick={() => {
                  setIsModalOpen(true);
                }}
                id="shadow"
                className="bg-white px-4 py-2 text-[14px] font-medium rounded-[10px] flex space-x-1 w-fit"
              >
                <img src="/images/Vector1.png" />
                <span className="whitespace-nowrap pr-4">Add Customer</span>
              </button>
            </div>
            <div className="relative overflow-x-auto min-h-screen h-full overflow-y-hidden">
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-[#055938] text-[#ffffff]">
                    <th className="px-7 py-3 text-[18px] font-medium">Name</th>
                    <th className="px-7 py-3 text-[18px] font-medium">Email</th>
                    <th className="px-7 py-3 text-[18px] font-medium">Phone</th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Total Spend
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Address
                    </th>
                    {/* <th className="px-7 py-3 text-[18px] font-medium">
                      Action
                    </th> */}
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
                          <td className="px-7 py-2 lg:py-4 whitespace-nowrap">
                            {item?.fullname}
                          </td>
                          <td className="px-7 py-2 lg:py-4 whitespace-nowrap">
                            {item?.email}
                          </td>
                          <td className="px-7 py-2 lg:py-4 whitespace-nowrap">
                            {item?.phone}
                          </td>
                          <td className="px-7 py-2 lg:py-4 whitespace-nowrap">
                            {item?.total_spent ?? "0"}
                          </td>
                          <td className="px-7 py-2 lg:py-4 whitespace-nowrap">
                            {item?.address ?? "....."}
                          </td>
                          {/* <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            <div className="p-4">
                              <div className="group relative">
                                <button>
                                  <BsThreeDots size={22} />
                                </button>
                                <nav
                                  tabIndex="0"
                                  className="border-2 bg-white invisible border-gray-800 rounded absolute right-14 -top-2 transition-all opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-1 z-10"
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
                      ))}
                    </>
                  ) : null}
                </tbody>
              </table>
              {metaData && metaData?.total > 0 ? (
                <Paginate metaData={metaData} setPageCurrent={setPageCurrent} />
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
