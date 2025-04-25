"use client";

import React, { useContext, useEffect } from "react";
import { useState } from "react";
import SideMenu from "@/components/menus/SideMenu";
import { getRequest } from "@/utils/apiFunctions";
import Button from "@/components/ui/button";
import ManageSubscriptions from "./manage-subscription";
import moment from "moment";
import { GlobalContext } from "@/context";

export default function Subscriptions() {
  const { merchant } = useContext(GlobalContext);
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);

  const getData = () => {
    getRequest(`/get-my-subscription`).then((res) => {
      setData(res?.data);
      setIsDataUpdated(false);
    });
  };

  useEffect(() => {
    getData();
  }, [merchant]);

  const [dataUpdated, setIsDataUpdated] = useState(false);
  useEffect(() => {
    if (dataUpdated == true) {
      getData();
    }
  }, [dataUpdated]);

  const handleModal = (data) => {
    setIsModalOpen(true);
    setCurrentModalData(data);
  };

  const ItemHeading = ({ value }) => {
    return (
      <div className="text-[10px] md:text-[12px] font-[600] uppercase px-10">
        {value || ""}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen h-screen overflow-hidden flex bg-[#171821] relative">
        <SideMenu />

        {modelIsOpen == true ? (
          <ManageSubscriptions
            mySubscription={data}
            modelIsOpen={modelIsOpen}
            setIsDataUpdated={setIsDataUpdated}
            setIsModalOpen={setIsModalOpen}
          />
        ) : null}

        <div className="w-[100%] xl:ml-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6 h-screen overflow-auto text-black bg-[#171821]">
          <div className="w-[100%] min-h-full  bg-[#F8F8F8] rounded-[20px]  py-10 lg:p-10 px-3 md:px-8  lg:pr-16">
            <div className="w-[100%] border-b-2 text-[24px] py">
              Pricing & Subscriptions
            </div>
            <div className="w-[100%] flex justify-end py-5 items-center">
              <button
                onClick={() => {
                  setIsModalOpen(true);
                }}
                id="shadow"
                className="bg-white px-4 py-2 text-[14px] rounded-[10px] flex space-x-3"
              >
                <img src="/images/Vector1.png" />
                <p>Manage Subscription</p>
              </button>
            </div>
            <div className="border w-full rounded-[8px] p-[20px] overflow-x-auto">
              <div className="flex justify-between min-w-fit">
                <div>
                  <ItemHeading value="Subscription" />
                  <div className="text-[14px] md:text-[16px] px-10 whitespace-nowrap font-[400]">
                    {data?.subscription?.name || "Free Plan"}
                  </div>
                </div>
                <div>
                  <ItemHeading
                    value={`${
                      data?.is_continue == false ? "Expired On" : "Renewal Date"
                    }`}
                  />
                  <div className="text-[14px] md:text-[16px] px-10 whitespace-nowrap font-[400]">
                    {data?.subscription?.name == "Basic Plan"
                      ? "-"
                      : data?.end_date
                      ? moment(data?.end_date).format("MMM D, YYYY")
                      : "-"}
                  </div>
                </div>
                <div>
                  <ItemHeading value="Status" />
                  <div className="text-[14px] md:text-[16px] px-10 whitespace-nowrap font-[400]">
                    {data?.status || "Active"}
                  </div>
                </div>
                <div>
                  <Button
                    onClick={() => {
                      setIsModalOpen(true);
                    }}
                    className="whitespace-nowrap text-[12px] md:!text-[14px]"
                  >
                    Upgrade Plan
                  </Button>
                </div>
              </div>
            </div>
            {/*  */}
          </div>
        </div>
      </div>
    </>
  );
}
