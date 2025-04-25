"use client";

import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

export default function MobileVerification() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [countryName, setCountryName] = useState(null);
  const [flag, setFlag] = useState(null);
  const handleCountries = (country) => {
    setCountryName(country.name);
    setFlag(country.flag);
    setShow(false);
  };
  const countries = [
    { name: "United States", flag: "us.png" },
    { name: "United Kingdom", flag: "uk.png" },
    { name: "Ireland", flag: "ic.png" },
    { name: "Pakistan", flag: "pk.png" },
    { name: "Canada", flag: "ca.png" },
    { name: "Australia", flag: "as.png" },
  ];
  return (
    <>
      <div className="flex justify-center items-center">
        <div className="md:w-[65%] sm:w-[85%] w-[90%] space-y-4 py-10">
          <div className="text-[#545353]  sm:text-[20px]">Activate Account</div>
          <div className="text-[#171821] font-bold sm:text-[28px]">
            Verify mobile phone number
          </div>
          <div className="text-[#545353] sm:text-[16px] text-[13px]">
            To help you keep your account safe, we’ll text a verification code
            to this phone number whenever you sign into Synko.
          </div>
          <div className="sm:flex sm:space-x-3 space-y-3 sm:space-y-0 w-[100%] ">
            {/* <div className="flex justify-between relative items-center w-[50%] px-3 py-2  rounded-[8px] border-2 border-[#D8D8D8] text-[#656565]">
              <div className="w-[100%]">
                <div className="text-black font-semibold">Country</div>
                <div
                  onClick={() => setShow(!show)}
                  className="w-[100%] flex items-center space-x-3 cursor-pointer"
                >
                  <div>
                    {flag ? (
                      <img src={flag} alt="" height={20} width={20} />
                    ) : (
                      <img src="us.png" alt="" height={20} width={20} />
                    )}
                  </div>
                  {countryName ? (
                    <div>{countryName}</div>
                  ) : (
                    <div>United States +1</div>
                  )}
                </div>
              </div>
              <div onClick={() => setShow(!show)} className="cursor-pointer">
                <IoIosArrowDown fontSize={20} />
              </div>
              <div
                className={`absolute top-[70px] left-0 right-0  shadow-lg duration-200 ${
                  show
                    ? "h-[250px] border overflow-y-auto"
                    : "h-0 overflow-hidden"
                } bg-[#F8F8F8]`}
              >
                {countries &&
                  countries?.map((items) => (
                    <div
                      onClick={() => handleCountries(items)}
                      className="px-5 w-[100%] border-b py-3 hover:bg-gray-100"
                    >
                      <div className="w-[100%] flex items-center space-x-3 cursor-pointer">
                        <div>
                          <img src={items.flag} alt="" height={20} width={20} />
                        </div>
                        <div>{items.name}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div> */}
            {/* <div className="w-[50%] px-3 py-2 rounded-[8px] border-2 border-[#D8D8D8] text-[#656565]">
              <div className="text-black font-semibold">
                Mobile phone number
              </div>
              <input
                placeholder="1 (123) 123-1234"
                className="bg-[#F8F8F8] w-[100%] outline-none"
              />
            </div> */}
          </div>
          <div className="sm:flex justify-between sm:space-y-0 space-y-2 w-[100%] ">
            <button
              onClick={() => setIsModalOpen(!isModalOpen)}
              className="bg-[#D9EFFF] rounded-[8px] px-4 py-3 text-[#8093A5] sm:text-[18px]"
            >
              Remind me Next time
            </button>
            <button className="bg-gradient-to-r from-[#18D89D] to-[#13AAE0] rounded-[8px] px-10 py-3 text-white sm:text-[18px]">
              Send Code
            </button>
          </div>
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-10">
              <div className="bg-white flex flex-col justify-center space-y-6 px-7 w-[300px] sm:w-[550px] sm:h-[280px] h-[400px] rounded-[10px] shadow-md relative">
                <div className="text-[#171821] sm:text-[24px] font-bold">
                  Are you sure?
                </div>
                <div className="text-[#545353] text-[12px] sm:text-[16px]">
                  You can protest your account balance by adding this extra
                  layer of security. You can alaways manage your 2-step
                  verificiation preferences in Account & Setting.
                </div>
                <div className="sm:flex px-4 justify-between sm:space-y-0 space-y-2 w-[100%] ">
                  <button
                    onClick={() => setIsModalOpen(!isModalOpen)}
                    className="bg-[#D9EFFF] rounded-[8px] px-5 py-4 text-[#8093A5]"
                  >
                    Protect your account
                  </button>
                  <button className="bg-gradient-to-r from-[#18D89D] to-[#13AAE0] rounded-[8px] px-5 py-4 text-white">
                    Remind me Next time
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
