import React from "react";

function Footer() {
  return (
    <div className="bg-[#06061F] relative pt-4">
      {/* <img src="/web/Ellipse 3.png" className="absolute   bottom-0 right-0" />
      <img src="/web/Ellipse 1.png" className="absolute   bottom-0 left-0" /> */}
      <div className="container mx-auto  px-4 lg:px-24">
        {/* <div className="border-b w-[100%] md:flex">
          <div className="w-[100%] md:w-[40%] text-white">
            <div className="md:border-r pt-4 mb-4 flex flex-col sm:items-start  items-center">
              <img
                src="/web/logo1.png"
                className="cursor-pointer  object-cover ease-in-out duration-300  hover:scale-125 z-10"
              />
              <p className="text-[16px] md:text-[20px]  text-center sm:text-start mt-6 md:mt-12">
                Lorem ipsum dolor sit amet, consectetur
              </p>
              <p className="text-[16px] md:text-[20px]  text-center sm:text-start">
                {" "}
                adipiscing elit. neque posuere, pulvinar.
              </p>
              <div className="flex gap-4 md:gap-8 mt-10 items-center">
                <img src="/web/phone.png" />
                <p>123234234324</p>
              </div>
              <div className="flex gap-4 md:gap-8 mt-10 items-center">
                <img src="/web/location.png" />
                <p>6 Fern road, Sandyford, Dublin 18.</p>
              </div>
            </div>
          </div>
          <div className="w-[100%] md:w-[60%] mb-4 pl-8 sm:px-0 sm:mb-0 grid grid-cols-2 mt-6 md:mt-0 md:grid-cols-3 text-white">
            <div className="flex flex-col sm:items-center relative z-10">
              <h1 className="text-[20px] md:text-[24px] font-bold object-cover ease-in-out duration-300  hover:scale-125 z-10 cursor-pointer">
                Services
              </h1>
              <ul className="mt-4 sm:mt-10 text-[14px] md:text-[16px] flex flex-col space-y-2 sm:space-y-6 text-[#ffffffa4]">
                <li className="cursor-pointer">lorem lorem</li>
                <li className="cursor-pointer">lorem</li>
                <li className="cursor-pointer">lorem lorem</li>
                <li className="cursor-pointer">lorem</li>
              </ul>
            </div>
            <div className="flex flex-col sm:items-center relative z-10">
              <h1 className="text-[20px] md:text-[24px] font-bold object-cover ease-in-out duration-300  hover:scale-125 z-10 cursor-pointer">
                About
              </h1>
              <ul className="mt-4 sm:mt-10 text-[14px] md:text-[16px] flex flex-col space-y-2 sm:space-y-6 text-[#ffffffa4]">
                <li className="cursor-pointer">lorem lorem</li>
                <li className="cursor-pointer">lorem</li>
                <li className="cursor-pointer">lorem lorem</li>
                <li className="cursor-pointer">lorem</li>
              </ul>
            </div>
            <div className="flex flex-col sm:items-center relative z-10 mt-6 md:mt-0">
              <h1 className="text-[20px] md:text-[24px] font-bold object-cover ease-in-out duration-300  hover:scale-125 z-10 cursor-pointer">
                Help
              </h1>
              <ul className="mt-4 sm:mt-10 text-[14px] md:text-[16px] flex flex-col space-y-2 sm:space-y-6 text-[#ffffffa4]">
                <li className="cursor-pointer">lorem lorem</li>
                <li className="cursor-pointer">lorem</li>
                <li className="cursor-pointer">lorem lorem</li>
                <li className="cursor-pointer">lorem</li>
              </ul>
            </div>
          </div>
        </div> */}
        <div className="md:flex text-white justify-between items-center py-4 md:py-12">
        
        <p className="text-[14px] md:text-[18px]">
            © 2023<a href="https://nexomos.com/" target="_blank"> Nexomos.</a> All rights reserved.
          </p>
       <a href="/">
       <img
            src="/web/logo1.png"
            className="cursor-pointer  object-cover ease-in-out duration-300  hover:scale-125 z-10"
          />
       </a>
          <div className="flex sm:justify-start justify-between px-10 sm:px-0 sm:gap-6  pt-5 md:pt-0 ">
            <img src="/web/x1.png" />
            <img src="/web/x2.png" />
            <a href="mailto:info@bistrosync.com" target="blank"><img src="/web/x3.png" /></a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
