"use client";
import SideMenu from "@/components/menus/SideMenu";
import { GlobalContext } from "@/context";
import { useContext, useState, useEffect } from "react";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { FaTrashAlt } from "react-icons/fa";
import Stack from "@mui/material/Stack";
import { IoArrowBackOutline } from "react-icons/io5";
import Link from "next/link";
import Checkbox from "@mui/material/Checkbox";

export default function Dipatch({ params }) {
  const { merchant, user, setMerchant } = useContext(GlobalContext);
  const [pageCurrent, setPageCurrent] = useState(1);
  const [notifications, setNotifications] = useState([]);
  let [selected_ids, set_selected_ids] = useState([]);
  const [metaData, setMetaData] = useState(1);
  const [isSelectedALL, setisSelectedALL] = useState(false);

  const get_notifications = () => {
    let url = `/merchant/${merchant?.id}/notifications?page=${pageCurrent}`;
    getRequest(url).then((res) => {
      if (res?.status == 200) {
        let not_data = res?.data?.notifications?.data;
        if (not_data?.length > 0) {
          not_data.forEach((item, index) => {
            item.is_selected = false;
          });
        }

        if (pageCurrent == 1) {
          setNotifications(not_data);
          setMetaData(res?.data?.notifications?.meta);
        } else {
          setNotifications((prevData) => {
            return [...prevData, ...not_data];
          });
          setMetaData(res?.data?.notifications?.meta);
        }
      }
    });
  };

  const handleNotifications = (payloads) => {
    postRequest(`/merchant/${merchant?.id}/notifications`, payloads)
      .then((res) => {
        if (res?.status == 200) {
          setisSelectedALL(false);
          get_notifications();
        }
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {});
  };

  useEffect(() => {
    // Check if merchant?.id is not undefined and user is truthy
    if (merchant?.id !== undefined && user) {
      get_notifications();
    }
  }, [user, merchant, pageCurrent]);

  const handleSelectAll = () => {
    let notification_data = notifications;
    if (notification_data?.length > 0) {
      let newData = [];
      notification_data.forEach((item, index) => {
        if (isSelectedALL == false) {
          item.is_selected = true;
          newData.push(item);
        } else {
          item.is_selected = false;
          newData.push(item);
        }
      });
      setNotifications(newData);
    }
  };

  useEffect(() => {
    if (notifications.length > 0) {
      let ids_ary = [];
      notifications.forEach((item, index) => {
        if (item?.is_selected == true) {
          ids_ary.push(item?.id);
        }
      });
      set_selected_ids(ids_ary);
    }
  }, [notifications]);

  const handleDeleteAll = () => {
    let payload = {
      action: "delete",
      ids_array: selected_ids,
    };
    handleNotifications(payload);
  };

  const handleLoadMore = () => {
    // console.log("metaData ", metaData)
    if (pageCurrent >= metaData?.last_page) {
      setPageCurrent(pageCurrent);
      return;
    }
    setPageCurrent(pageCurrent + 1);
  };

  return (
    <div className="min-h-screen flex bg-[#171821] relative">
      <SideMenu />

      <div className=" w-[100%] xl:pl-0 xl:w-[80%] px-5 py-6  text-black bg-[#171821]">
        <div className=" px-4 md:px-10 rounded-lg py-12 bg-gray-50 w-[100%] min-h-screen">
          <div className="flex">
            <Link
              href="/dashboard"
              className="rounded-full w-[50px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white text-[25px] flex items-center justify-center"
            >
              <IoArrowBackOutline />
            </Link>
            <p className="text-[28px] md:text-[33px] uppercase ml-3">
              Notifications
            </p>
          </div>

          <hr className="mt-4" />
          <div className="w-[100%] flex py-5 gap-4 flex-start">
            <div className="flex flex-between justify-center items-center cursor-pointer px-3">
              <Checkbox
                onClick={() => {
                  setisSelectedALL(!isSelectedALL);
                  handleSelectAll();
                }}
                checked={isSelectedALL}
              />
              <p>Select ALL</p>
            </div>

            {selected_ids.length > 0 ? (
              <>
                <button
                  className="cursor-pointer px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                  onClick={() => {
                    let payload = {
                      action: "update",
                      ids_array: selected_ids,
                    };
                    handleNotifications(payload);
                  }}
                >
                  Mark As Read
                </button>
                <button
                  onClick={() => {
                    handleDeleteAll();
                  }}
                  className="cursor-pointer px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                >
                  Delete All
                </button>
              </>
            ) : (
              <></>
            )}
          </div>

          <hr />
          <div className="relative overflow-x-auto min-h-screen h-full overflow-y-hidden mt-2">
            {notifications?.length > 0 ? (
              <>
                <Stack sx={{ width: "100%" }} spacing={2}>
                  {notifications?.map((item, index) => {
                    return (
                      <div key={index + 1}>
                        {item?.is_checked == 1 ? (
                          <>
                            <div className="flex items-center bg-gray-100 p-4 rounded shadow-md w-full mt-4">
                              <Checkbox
                                onClick={() => {
                                  let not_data = notifications;
                                  let newData = [];
                                  not_data.forEach((item2, index2) => {
                                    if (item2?.id == item?.id) {
                                      item2.is_selected = !item2.is_selected;
                                    }
                                    newData.push(item2);
                                  });

                                  setNotifications(newData);
                                }}
                                checked={item?.is_selected}
                              />
                              <span className="flex-grow text-gray-800">
                                {item?.message}
                              </span>
                              <button
                                onClick={() => {
                                  let payload = {
                                    action: "update",
                                    ids_array: [item?.id],
                                  };
                                  handleNotifications(payload);
                                }}
                                className="ml-4 text-black px-4 text-[12px]"
                              >
                                Mark As Read
                              </button>
                              <button
                                onClick={() => {
                                  let payload = {
                                    action: "delete",
                                    ids_array: [item?.id],
                                  };
                                  handleNotifications(payload);
                                }}
                                className="ml-4 px-2 py-2"
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center bg-gray-300 p-4 rounded shadow-md w-full mt-4">
                              <Checkbox
                                onClick={() => {
                                  let not_data = notifications;
                                  let newData = [];
                                  not_data.forEach((item2, index2) => {
                                    if (item2?.id == item?.id) {
                                      item2.is_selected = !item2.is_selected;
                                    }
                                    newData.push(item2);
                                  });

                                  setNotifications(newData);
                                }}
                                checked={item?.is_selected}
                              />
                              <span className="flex-grow text-gray-800">
                                {item?.message}
                              </span>
                              <button
                                onClick={() => {
                                  let payload = {
                                    action: "update",
                                    ids_array: [item?.id],
                                  };
                                  handleNotifications(payload);
                                }}
                                className="ml-4 text-black px-4 text-[12px]"
                              >
                                Mark As Read
                              </button>
                              <button
                                onClick={() => {
                                  let payload = {
                                    action: "delete",
                                    ids_array: [item?.id],
                                  };
                                  handleNotifications(payload);
                                }}
                                className="ml-4 px-2 py-2"
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </Stack>

                {pageCurrent >= metaData?.last_page ? (
                  <></>
                ) : (
                  <>
                    <div className="my-[20px] flex justify-center">
                      <button
                        onClick={() => {
                          handleLoadMore();
                        }}
                        className="cursor-pointer px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                      >
                        Load More
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <p className="text-center">No Data found</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
