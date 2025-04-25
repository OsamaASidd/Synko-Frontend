"use client";
import React, { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";

function Header() {
  // const [showSideBar, setshowSideBar] = useState(false);
  return (
    <div className="flex justify-between items-center px-4 md:px-[80px] lg:px-[130px] mx-auto py-10 text-white">
      <div>
      <a href="/">
      <img
          src="/web/logo1.png"
          className="cursor-pointer object-cover ease-in-out duration-300 relative z-10 hover:scale-125"
        />
      </a>
      </div>

      <div className="hidden sm:flex gap-2 text-[14px] sm:text-[16px] md:gap-8 ">
        <a
          href="/login"
          className="cursor-pointer  px-2 rounded-lg  object-cover ease-in-out duration-300  z-10 hover:scale-125"
        >
          Sign in
        </a>
        {/* <a
          href="/"
          className="cursor-pointer  px-2 rounded-lg  object-cover ease-in-out duration-300  z-10 hover:scale-125"
        >
          About us
        </a>
        <a
          href="/"
          className="cursor-pointer  px-2 rounded-lg  object-cover ease-in-out duration-300  z-10 hover:scale-125"
        >
          Pricing
        </a>
        <a
          href="/"
          className="cursor-pointer  px-2 rounded-lg  object-cover ease-in-out duration-300  z-10 hover:scale-125"
        >
          Blogs
        </a>
        <a
          href="/"
          className="cursor-pointer  px-2 rounded-lg  object-cover ease-in-out duration-300  z-10 hover:scale-125"
        >
          Contact us
        </a> */}
      </div>
      <a
       href="/login"
        // onClick={() => setshowSideBar(true)}
        className="sm:hidden flex gap-2 text-[14px] text-white sm:text-[16px] duration-300 md:gap-8 z-10"
      >
        <GiHamburgerMenu size="24" />
      </a>
      {/* <div
        className={`sm:hidden flex flex-col ${
          showSideBar ? "w-[90%] px-5" : "w-0"
        } overflow-hidden duration-700 fixed top-0 right-0 bottom-0 text-blue-600 pt-20 space-y-4 bg-white z-40 gap-2 text-[14px] md:gap-8 `}
      >
        <div
          onClick={() => setshowSideBar(false)}
          className="absolute z-30 bg-gray-200 top-10 left-2 w-8 h-8 text-center rounded-full flex justify-center items-center text-[18px]"
        >
          <p>X</p>
        </div>
        <a
          href="/"
          className="cursor-pointer  bg-clip-text text-transparent bg-gradient-to-r from-[#1198FB] to-[#1BEF7C] "
        >
          About us
        </a>
        <a
          href="/"
          className="cursor-pointer  bg-clip-text text-transparent bg-gradient-to-r from-[#1198FB] to-[#1BEF7C] "
        >
          Pricing
        </a>
        <a
          href="/"
          className="cursor-pointer  bg-clip-text text-transparent bg-gradient-to-r from-[#1198FB] to-[#1BEF7C] "
        >
          Blogs
        </a>
        <a
          href="/"
          className="cursor-pointer  bg-clip-text text-transparent bg-gradient-to-r from-[#1198FB] to-[#1BEF7C] "
        >
          Contact us
        </a>
      </div> */}
    </div>
  );
}

export default Header;
