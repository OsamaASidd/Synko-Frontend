"use client";

import { motion } from "framer-motion";
import Header from "@/components/web/Header";
import Footer from "@/components/web/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { GlobalContext } from "@/context";
import { useEffect } from "react";
import FullPageLoader from "@/components/ui/full-page-loader";

export default function Home() {
  const { isAuthUser, user, merchant } = useContext(GlobalContext);
  const router = useRouter();

  useEffect(() => {
    if (
      user != null &&
      typeof user === "object" &&
      typeof merchant === "object"
    ) {
      function isEmpty(obj) {
        return Object?.keys(obj)?.length === 0;
      }

      if (isEmpty(user) == false && isEmpty(merchant) == false) {
        router.push("/dashboard");
        return;
      }
    } else {
      router.push("/login");
    }
  }, [merchant, user, router]);

  return <FullPageLoader />;
  return (
    <div className="bg-white  overflow-hidden">
      <section
        style={{
          background: `url("/web/Vector2.png")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          // backgroundRepeat: "no-repeat",
          height: "1150px",
        }}
        // className="z-30"
      >
        <Header />
        <img
          src="/web/Ellipse 1 (1).png"
          className="absolute top-2 bottom-0 right-0"
        />
        {/* <img
            src="/web/cross 1.png"
            className="absolute left-[500px] top-0"
          /> */}

        <img src="/web/Ellipse 1 (2).png" className="absolute left-0 top-8 " />

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col justify-center relative items-center mt-16 px-6 sm:px-4 text-center"
          >
            {" "}
            <img
              src="/web/satum.png"
              className="hidden md:block absolute top-[75%] left-[18%] animate-bounce"
            />{" "}
            <img
              src="/web/cone 1.png"
              className="absolute top-[200px] right-[300px] animate-spin"
            />
            <h1 className="text-[26px] md:text-[32px] lg:text-[50px] font-bold z-30 relative text-white">
              Unlock the Future of Point of Sale with
            </h1>
            <div className="text-[24px] md:text-[28px] lg:text-[40px]  font-semibold mt-10 text-white">
              Your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1BEF7C] to-[#1198FB] ">
                All-in-One POS Solution
              </span>
            </div>
            <p className="text-[14px] md:text-[16px] lg:text-[20px] mt-4 text-white">
              Boost Efficiency, Increase Revenue, and Delight Your Customers
            </p>
            <div className="flex justify-center items-center text-white  relative z-30 gap-[10px] sm:gap-[50px] mt-10">
              {/* <p className="flex justify-center items-center  cursor-pointer gap-2 sm:gap-6 text-[16px] lg:text-[20px] ">
                <BsPlayCircle className="text-[24px] lg:text-[40px]" />
                Watch a Video
              </p> */}
              <Link
                href="/login"
                className="bg-gradient-to-r from-[#1198FB] to-[#1BEF7C] px-4 sm:px-10 py-1 sm:py-2 rounded-lg shadow-xl hover:scale-110 duration-200 z-1  font-semibold text-[16px] lg:text-[20px]"
              >
                Try a Demo
              </Link>
            </div>
          </motion.div>
        </motion.div>

        <div className="flex justify-center items-center mt-[150px] px-[100px]">
          <img src="/web/screen.png" />
        </div>
      </section>
      <section className="sm:mt-[100px] md:mt-[150px] py-16">
        <div className=" w-[100%]  px-4 min-[1200px]:px-24">
          <div className="flex flex-col lg:flex-row justify-center items-center w-[100%]  mb-10">
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              whileInView={{ opacity: 1, x: 1 }}
              transition={{ duration: 1.5 }}
              className="w-[100%] lg:w-[60%]  min-[1200px]:px-16 "
            >
              <div className="lg:pl-24 flex flex-col items-center lg:items-start">
                <p className="text-[#464646] text-[26px] sm:text-[30px]  md:text-[40px] font-bold">
                  Why{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1198FB] to-[#1BEF7C] ">
                    Bistro Sync{" "}
                  </span>{" "}
                  is the Perfect
                </p>
                <p className="text-[#464646] text-[26px] sm:text-[30px]  md:text-[40px] font-bold">
                  {" "}
                  POS System for Your Business?
                </p>
              </div>
              <div>
                <div className="grid sm:grid-cols-2 gap-x-16 gap-y-5 mt-14">
                  <div className="flex justify-center items-center">
                    <img src="/web/object 1.png" className="z-10 relative" />
                    <button className="bg-white shadow-xl text-[#464646] px-3 -ml-10 z-0 relative font-semibold text-[10px] sm:text-[12px] rounded-lg py-4">
                      Efficiency at Its Best
                    </button>
                  </div>
                  <div className="flex justify-center items-center">
                    <img src="/web/Design.png" className="z-10 relative" />
                    <button className="bg-white shadow-xl text-[#464646] px-7 -ml-10 z-0 relative font-semibold text-[10px] sm:text-[12px] rounded-lg py-4">
                      Sales Insights
                    </button>
                  </div>
                  <div className="flex justify-center items-center -mt-4">
                    <img src="/web/roc.png" className="z-10 relative" />
                    <button className="bg-white shadow-xl text-[#464646] px-3 -ml-10 z-0 relative font-semibold text-[10px] sm:text-[12px] rounded-lg py-4">
                      Customizable Menu
                    </button>
                  </div>
                  <div className="flex justify-center items-center -mt-4">
                    <img src="/web/card.png" className="z-10 relative" />
                    <button className="bg-white shadow-xl text-[#464646] px-3 -ml-7 z-0 relative font-semibold  text-[10px] sm:text-[12px] rounded-lg py-4">
                      Secure Transactions
                    </button>
                  </div>
                </div>
                {/* <div className="flex gap-9"></div> */}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 200 }}
              whileInView={{ opacity: 1, x: 1 }}
              transition={{ duration: 1.5 }}
              id="card1"
              className="w-[100%] sm:w-[75%] flex justify-center items-center  lg:w-[40%] mt-8 md:mt-0 sm:p-10 "
            >
              <img
                src="/web/screen2.png"
                className="md:w-[90%] rounded-[20px] hover:scale-110 duration-300 "
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#06061F] py-16">
        <div className=" px-5 sm:px-10 min-[1200px]:px-24">
          <div className="w-[100%] flex flex-col lg:flex-row justify-center items-center ">
            <motion.div
              animate={{ x: [0, 50, 0] }}
              transition={{ repeat: 3, duration: 2, ease: "linear" }}
              className="w-[100%] sm:w-[75%] lg:w-[40%]  flex justify-center "
            >
              <img
                src="/web/form 1.png"
                className="hover:scale-110 duration-300"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -300 }}
              whileInView={{ opacity: 1, y: 1 }}
              transition={{ duration: 2.5 }}
              className="w-[100%] lg:w-[60%] px-2 sm:px-5 lg:px-8 "
            >
              <div className="mt-6">
                <p className="text-white text-[20px] sm:text-[28px] md:text-[44px] font-bold">
                  Experience the
                </p>
                <p className="text-white text-[20px] sm:text-[28px] md:text-[44px] font-bold">
                  Future of Point of Sale{" "}
                </p>
              </div>
              <div className="mt-6">
                <p className="text-[#ffffffa4] text-[16px] sm:text-[20px] ">
                  Discover the Bistro Sync advantage with a 14-day free trial
                </p>
                <p className="text-[#ffffffa4] text-[16px] sm:text-[20px] ">
                  No commmitment required.{" "}
                </p>
              </div>
              <div className="border rounded-full py-1 md:py-2 flex flex-col md:flex-row justify-center md:justify-between items-center md:px-2 mt-16">
                <input
                  placeholder="Enter Email"
                  className="bg-[#06061F] outline-none py-2 md:py-4 text-[14px] sm:text-[16px]   rounded-full pl-10 md:pl-5 text-white "
                />
                <button className="rounded-full gradient text-[14px] sm:text-[18px] py-2 md:py-4 px-4 sm:px-10 mt-2 sm:mt-0  md:block hidden text-white">
                  Try free Trial
                </button>
              </div>
              <button className="rounded-full gradient text-[14px] sm:text-[18px] py-3 md:py-4 w-[100%] mt-2 md:mt-0 block md:hidden">
                Try free Trial
              </button>
              <div className="flex flex-col md:flex-row text-white space-y-3 md:space-y-0 md:justify-between items-center mt-8">
                <div className="flex justify-center items-center gap-4">
                  <img src="/web/img1.png" />
                  <p>Free 7-days Trial</p>
                </div>
                <div className="flex justify-center items-center gap-4 ">
                  <img src="/web/img2.png" />
                  <p>No credit Card Required</p>
                </div>
                <div className="flex justify-center items-center gap-4">
                  <img src="/web/img3.png" />
                  <p>Cancel Anytime</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* <section className="bg-[#F9F9F9] py-10">
        <div className="container mx-auto min-[1200px]:px-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col justify-center items-center"
            >
              <div className="flex justify-center items-center ">
                <div className="bg-[#d2d2d238] w-[80px] md:w-[120px] h-[80px] md:h-[120px] rounded-full flex justify-center items-center rotate-180">
                  <img src="/web/qomas.png" className="rotate-180" />
                </div>
                <p className="text-[#070E24] text-[25px] sm:text-[30px]  md:text-[40px]  font-bold pl-4 sm:pl-0">
                  What Our Customers
                </p>
              </div>
              <p className="text-[#070E24] text-[25px] sm:text-[30px]  md:text-[40px]  font-bold">
                {" "}
                Are Saying
              </p>
            </motion.div>
          </motion.div>
          <Banner />
        </div>
      </section> */}

      <section className="bg-white py-16">
        <div className="container mx-auto  px-4 md:px-10 lg:px-24">
          <div className="flex flex-col items-center justify-center">
            <p className=" text-center text-[26px] sm:text-[30px]  md:text-[40px] text-[#020202] font-bold">
              Solution built for every budget
            </p>
            <div className="md:flex gap-8  space-y-4 md:space-y-0 mt-6">
              <div className="flex justify-center items-center cursor-pointer hover:scale-125 duration-200 gap-2">
                <img src="/web/click.png" />
                <p className="text-[#464646] text-[12px] ">
                  Simple & User Friendly
                </p>
              </div>
              <div className="flex justify-center items-center cursor-pointer hover:scale-125 duration-200 gap-2">
                <img src="/web/click.png" />
                <p className="text-[#464646] text-[12px] ">Sales insights</p>
              </div>
              <div className="flex justify-center items-center cursor-pointer hover:scale-125 duration-200 gap-2">
                <img src="/web/click.png" />
                <p className="text-[#464646] text-[12px] ">Customizable Menu</p>
              </div>
              <div className="flex justify-center items-center cursor-pointer hover:scale-125 duration-200 gap-2">
                <img src="/web/click.png" />
                <p className="text-[#464646] text-[12px] ">
                  Multiple screen sizes
                </p>
              </div>
              <div className="flex justify-center items-center cursor-pointer hover:scale-125 duration-200 gap-2">
                <img src="/web/click.png" />
                <p className="text-[#464646] text-[12px] ">Reliability</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-16 px-4 sm:px-0">
            <div className="pt-4 hover:scale-105 duration-200 hover:shadow-2xl bg-[#1198FB] max-h-[500px]  rounded-[10px]">
              <div className="border border-gray-500 rounded-[10px]  p-[15px] space-y-6 lg:space-y-2 h-full  bg-white">
                <p className="text-[#2F2F2F] sm:text-[18px] font-bold ">
                  Basic Plan - Starter
                </p>

                <div className="h-[280px] pt-6 overflow-y-auto">
                  <ul className="list-disc px-8">
                    <li className="text-[#2F2F2F]  font-semibold ">
                      Price:{" "}
                      <span className="text-[16px] font-normal">$X/month</span>
                    </li>
                    <li className="text-[#2F2F2F] font-semibold ">Features</li>
                  </ul>

                  <ul className="list-disc px-12">
                    <li>Admin Panel</li>
                    <li>1 Merchant</li>
                    <li>Items and Categories Management</li>
                    <li>Order History</li>
                    <li>1 Device Access for POS</li>
                    <li>Employee Creation (limited)</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button className="bg-[#2B4FB9] duration-200 hover:bg-[#13A8E2] px-5 lg:px-8 py-2 lg:py-2 rounded-[5px]  text-[15px] sm:text-[18px]  text-white">
                    Get Starter Plan
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-4 hover:scale-105 duration-200 hover:shadow-2xl bg-[#13A8E2] max-h-[500px] rounded-[10px]">
              <div className="border border-gray-500 rounded-[10px]  p-[15px] space-y-6 lg:space-y-2 h-full  bg-white">
                <p className="text-[#2F2F2F] sm:text-[18px] font-bold ">
                  Standard Plan - Advanced
                </p>

                <div className="h-[280px] pt-6 overflow-y-auto">
                  <ul className="list-disc px-8">
                    <li className="text-[#2F2F2F]  font-semibold ">
                      Price:
                      <span className="text-[16px] font-normal">
                        {" "}
                        $Y/month{" "}
                      </span>
                    </li>
                    <li className="text-[#2F2F2F] font-semibold ">
                      Features (Includes all Basic Plan features plus)
                    </li>
                  </ul>

                  <ul className="list-disc px-12">
                    <li>Multiple Manager Dashboards</li>
                    <li>Reporting Dashboard</li>
                    <li>Multiple Merchants Support</li>
                    <li>Discounts Management</li>
                    <li>Inventory Management</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button className="bg-[#2B4FB9] duration-200 hover:bg-[#13A8E2] px-5 lg:px-8 py-2 lg:py-2 rounded-[5px]  text-[15px] sm:text-[18px]  text-white">
                    Get Starter Plan
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-4 hover:scale-105 duration-200s hover:shadow-2xl bg-[#17D0A8] max-h-[500px] rounded-[10px]">
              <div className="border border-gray-500 rounded-[10px]  p-[15px] space-y-6 lg:space-y-2 h-full  bg-white">
                <p className="text-[#2F2F2F] sm:text-[18px] font-bold ">
                  Basic Plan - StarterPremium Plan - Pro
                </p>
                <div className="h-[280px] pt-6 overflow-y-auto">
                  <ul className="list-disc px-8">
                    <li className="text-[#2F2F2F]  font-semibold ">
                      Price:{" "}
                      <span className="text-[16px] font-normal">$Z/month</span>
                    </li>
                    <li className="text-[#2F2F2F] font-semibold ">
                      Features (Includes all Standard Plan features plus
                    </li>
                  </ul>

                  <ul className="list-disc px-12">
                    <li>Modifiers</li>
                    <li>Table Management</li>
                    <li>Manage Devicest</li>
                    <li>Enhanced Reporting Dashboard with Custom Reports</li>
                    <li>Comprehensive Employee Management</li>
                    <li>Priority Support</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button className="bg-[#2B4FB9] duration-200 hover:bg-[#13A8E2] px-5 lg:px-8 py-2 lg:py-2 rounded-[5px]  text-[15px] sm:text-[18px]  text-white">
                    Get Starter Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-[#2F2F2F] sm:text-[18px] font-bold ">Note:</p>
            <ul className="list-disc pl-10 mt-2">
              <li>Prices are subject to change</li>
              <li>
                Each plan includes all the features of the previous plan, with
                additional functionalities.
              </li>
              <li>
                Custom plans can be arranged upon request with specific features
                tailored to individual needs.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-4 lg:px-24 py-6 md:py-12">
          <div className="gradient rounded-[25px]">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 1 }}
              transition={{ duration: 2 }}
              className="grid grid-cols-1 lg:grid-cols-2 px-4 md:px-12 py-[30px] md:py-[60px]"
            >
              <div className="text-white">
                <p className="text-[35px] md:text-[50px] font-bold">
                  Let’s talk!
                </p>
                <p className="text-[14px] md:text-[20px] flex md:gap-2 items-center   text-[#ffffffb6]">
                  Ask us anything or just say hi{" "}
                  <img src="/web/hi.png" className="animate-pulse" />
                </p>
                {/* <div className="flex  items-center gap-4 md:gap-8 mt-10 md:mt-[100px]">
                  <img src="/web/phone2.png" />
                  <p className="font-bold text-[14px] md:text-[20px]">
                    1232434234
                  </p>
                </div> */}
                <div className="flex  items-center gap-4 md:gap-8 mt-4 md:mt-6">
                  <img src="/web/mail.png" />
                  <a
                    href="mailto:info@bistrosync.com"
                    target="blank"
                    className="font-bold text-[14px] md:text-[20px]"
                  >
                    info@bistrosync.com
                  </a>
                </div>
              </div>
              <div>
                <form>
                  <div className="mt-6 md:mt-0 md:flex gap-10 text-white">
                    <div className="flex flex-col text-white w-[100%]">
                      <label className="mb-2 text-[20px]">Name</label>

                      <input
                        className=" outline-none bg-transparent border-b py-4 text-[18px] text-[#ffffff] placeholder:text-[#FFFFFF80]"
                        required
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="flex flex-col text-white w-[100%]">
                      <label className="mb-2 text-[20px]">Email</label>

                      <input
                        className=" outline-none bg-transparent border-b py-4 text-[18px] text-[#ffffff] placeholder:text-[#FFFFFF80]"
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col text-white mt-6">
                    <label className="mb-2 text-[20px]">Message</label>

                    <input
                      className=" outline-none bg-transparent border-b py-4 text-[18px] text-[#ffffff] placeholder:text-[#FFFFFF80]"
                      required
                      placeholder="Enter your message"
                    />
                  </div>

                  <button className="bg-white px-3 md:px-7 py-2 md:py-4 text-[14px] sm:text-[16px] text-[#1198FB] mt-12 rounded-[4px]">
                    Send Message
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
