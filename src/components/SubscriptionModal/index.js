"use client";
import React, { useEffect, useState } from "react";

export default function SubscriptionModal() {
  const [isModal, setIsModal] = useState(false);

  useEffect(() => {
    const currentPath = window.location.pathname;
    let UserToken = localStorage.getItem("synko_merchant_token");
    let MerchantToken = localStorage.getItem("synko_user_token");
    if (
      !UserToken ||
      !MerchantToken ||
      currentPath === "/manage/subscription"
    ) {
      setIsModal(false);
      return;
    } else {
      setIsModal(true);
    }
  }, []);

  const Redirect = () => {
    const url = "http://localhost:3000/manage/subscription";
    window.open(url, "_blank");
    setIsModal(false);
  };
  const Skip = () => {
    setIsModal(false);
  };

  return (
    <>
      {isModal ? (
        <div className=" fixed top-0 left-0 bottom-0 right-0 bg-[#0000001a] z-30 flex justify-center items-center">
          <div className=" bg-white  text-black w-[70%] sm:w-[50%] lg:w-[50%] md:w-[60%] px-6 shadow-lg overflow-hidden sm:py-8 py-4 flex justify-center items-center  rounded-3xl duration-300  flex-col gap-3">
            <p className="lg:text-[17px] sm:text-[15px] text-[12px] md:text-[16px] font-normal text-center">
              Your free trial period for Synko POS has officially ended. To
              continue accessing all the powerful features, upgrade your plan
              today and unlock the full potential of Synko POS.
            </p>
            <button
              onClick={Redirect}
              className="sm:px-4 py-2 px-2 text-[13px] sm:text-[18px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white rounded-[10px] mt-5"
            >
              Subscribe Now
            </button>
            <a
              className="text-black text-[13px] sm:text-[18px] cursor-pointer"
              onClick={Skip}
            >
              Skip For Now
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
