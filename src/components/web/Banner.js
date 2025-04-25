"use client";
import React, { useState } from "react";
import { AiFillStar } from "react-icons/ai";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

export default function Banner() {
  const [picture, setPicture] = useState(0);

  const review = [
    {
      title:
        "Since switching to Bistro Sync, our restaurant has never been more efficient. The reporting and analytics tools have transformed the way we do business",
      name: "Mary Wood",
    },
    {
      title:
        "Since switching to Bistro Sync, our restaurant has never been more efficient. The reporting and analytics tools have transformed the way we do business",
      name: "John",
    },
    {
      title:
        "Since switching to Bistro Sync, our restaurant has never been more efficient. The reporting and analytics tools have transformed the way we do business",
      name: "Mary Wood",
    },
    {
      title:
        "Since switching to Bistro Sync, our restaurant has never been more efficient. The reporting and analytics tools have transformed the way we do business",
      name: "Michael Lusby",
    },
    {
      title:
        "Since switching to Bistro Sync, our restaurant has never been more efficient. The reporting and analytics tools have transformed the way we do business",
      name: "David",
    },
    {
      title:
        "Since switching to Bistro Sync, our restaurant has never been more efficient. The reporting and analytics tools have transformed the way we do business",
      name: "David Warner",
    },
    {
      title:
        "Since switching to Bistro Sync, our restaurant has never been more efficient. The reporting and analytics tools have transformed the way we do business",
      name: "David Warner",
    },
  ];

  const data = [
    {
      img: "/web/Mask group.png",
    },
    {
      img: "/web/Mask group.png",
    },
    {
      img: "/web/Mask group.png",
    },
    {
      img: "/web/Mask group.png",
    },
    {
      img: "/web/Mask group.png",
    },
    {
      img: "/web/Mask group.png",
    },
    {
      img: "/web/Mask group.png",
    },
    {
      img: "/web/Mask group.png",
    },
    {
      img: "/web/Mask group.png",
    },
  ];
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  return (
    <div className=" w-[100%] flex flex-col justify-between py-4 lg:py-10 bg-[#F9F9F9]  text-gray-700 ">
      <Carousel
        className=" py-10"
        responsive={responsive}
        showArrows={true}
        focusOnSelect={true}
        infinite={true}
      >
        {review.map((item, index) => (
          <li
            className="flex flex-col justify-center items-center  mx-5 hover:scale-110 duration-300  shadow-lg shadow-gray-400 bg-white"
            key={index}
            style={{ flex: "0 0 33.33%" }}
          >
            <div className="w-[130px] h-[130px] border rounded-full -mt-6 bg-white flex justify-center items-center">
              <img src="/web/Mask group.png" className="w-[100%]" />
            </div>
            <div className="relative flex flex-col justify-center space-y-5 items-center py-[50px] lg:py-[100px]  z-10 bg-white px-6">
              {/* <p className="font-semibold text-[26px]  text-center text-[#54A2DE]">
                Recommends
              </p> */}
              <p className="text-center font-semibold uppercase text-black z-10">
                {item.name}
              </p>
              <p className="flex justify-center items-center z-10">
                <AiFillStar size="20" color="#fbbb17" />
                <AiFillStar size="20" color="#fbbb17" />
                <AiFillStar size="20" color="#fbbb17" />
                <AiFillStar size="20" color="#fbbb17" />
                <AiFillStar size="20" color="#fbbb17" />
              </p>
              <p className="text-center z-10 px-2 mt-4 text-[14px]">
                {item.title}
              </p>

              {/* <div className="bg-white w-[90px] h-[130px] absolute -bottom-7 left-16 z-0 shadow-lg rotate-45"></div> */}
            </div>
          </li>
        ))}
      </Carousel>
    </div>
  );
}
