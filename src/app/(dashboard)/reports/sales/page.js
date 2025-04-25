"use client";
import SideMenu from "@/components/menus/SideMenu";
import { BsGraphUp } from "react-icons/bs";
import Link from "next/link";
import { GlobalContext } from "@/context";
import { useContext, useEffect, useState } from "react";
import { getRequest } from "@/utils/apiFunctions";

import ReportModals from "@/components/reports/ReportModals";
import { FaFileExport } from "react-icons/fa6";
// import ReactApexChart from "react-apexcharts";

import dynamic from "next/dynamic";
const ReactApexChartCustom = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function Reports() {
  const { merchant, user } = useContext(GlobalContext);

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [query, setQeury] = useState("today");
  const [perGraph, setPerGraph] = useState({
    card: 0,
    cash: 0,
    other: 0,
  });
  const getSummaryData = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/get_dashboard_sales?dateFrom=${dateFrom}&dateTo=${dateTo}`
    )
      .then((res) => {
        setData(res.data);
        setPerGraph({
          cash: ((res?.data?.cash / res?.data?.net_sale) * 100).toFixed(2),
          card: ((res?.data?.card / res?.data?.net_sale) * 100).toFixed(2),
          other: ((res?.data?.other / res?.data?.net_sale) * 100).toFixed(2),
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDateFromChange = (e) => {
    const newDateFrom = e.target.value;
    setDateFrom(newDateFrom);

    // Set Date To as the same or later
    if (!dateTo || newDateFrom > dateTo) {
      setDateTo(newDateFrom);
    }
  };
  function formatDate(dateString) {
    if (!dateString) return "";

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString("en-US", options);
  }

  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Total Cost",
        data: [],
      },
    ],
    options: {
      chart: {
        type: "area",
        height: 350,
      },
      stroke: {
        curve: "smooth", // This is what makes it a Spline chart
        colors: ["#13AAE0"], // Set the line color
      },
      fill: {
        type: "gradient",
        gradient: {
          colorStops: [
            {
              offset: 0,
              color: "#18D89D", // Start color for the fill
              opacity: 1,
            },
            {
              offset: 100,
              color: "#18D89D", // End color for the fill
              opacity: 0.3,
            },
          ],
        },
      },
      xaxis: {
        categories: [],
      },
      // ... other chart options
    },
  });

  const handleSubmitButton = () => {
    if (dateTo && dateFrom && typeof window !== "undefined") {
      getData();
    }
  };

  const getData = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/get_sales_summary_graph?dateFrom=${dateFrom}&dateTo=${dateTo}`
    )
      .then((res) => {
        const { seriesData, categoriesData } = res.data;

        setChartData({
          series: [
            {
              name: "Total Cost",
              data: seriesData,
            },
          ],
          options: {
            ...chartData.options,
            xaxis: {
              ...chartData.options.xaxis,
              categories: categoriesData,
            },
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error case here
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const [modals, setModals] = useState(null);

  useEffect(() => {
    if (user !== null && merchant !== null) {
      if (dateTo && dateFrom) {
        getData();
      }
    }
  }, [user, merchant, query]);

  return (
    <div className="min-h-screen flex bg-[#171821] relative">
      <SideMenu />
      <ReportModals
        dateTo={dateTo}
        dateFrom={dateFrom}
        setModals={setModals}
        modals={modals}
      />
      <div className=" w-[100%] xl:pl-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6  text-black bg-[#171821]">
        <div className=" px-4 md:px-10 rounded-lg py-12 bg-gray-50 w-[100%] h-[calc(100vh-48px)] overflow-y-auto">
          <div className="flex">
            <p className="text-[28px] md:text-[33px]">Reports</p>
          </div>

          <hr className="mt-8" />

          <div className="flex flex-col w-[100%]">
            {/* <div className="w-[100%] flex justify-between items-center my-[10px]">
                            <p className="text-[18px] md:text-[24px] px-4 font-[500]">
                                Overview
                            </p>
                            <div className="flex space-x-2 items-center">
                                <div className="flex space-x-4 items-center">
                                    <label>Date From</label>
                                    <input
                                        type="datetime-local"
                                        value={dateFrom}
                                        onChange={handleDateFromChange}
                                        className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                                    />
                                </div>
                                <div className="flex space-x-4 items-center">
                                    <label>Date To</label>
                                    <input
                                        type="datetime-local"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        if (!dateFrom && !dateTo) {
                                            alert("Please select dates to proceed!");
                                            return;
                                        }
                                        handleSubmitButton();
                                    }}
                                    className="p-[8px] bg-gradient-to-r from-[#13AAE0] to-[#18D89D] rounded-[5px]"
                                >
                                    <IoSearch size={20} color="white" />
                                </button>
                            </div>
                        </div> */}

            <hr />
            <div class="grid grid-cols-3 sm:grid-cols-3 gap-4 p-4">
              {/* item one */}
              <Link href="/reports/sales/sales-overview">
                <div class="px-3 mt-3 bg-[white] py-5 outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex">
                  <div className="flex items-center justify-center w-[50px] h-[50px]">
                    <BsGraphUp size={30} />
                  </div>
                  <div>
                    <p className="text-[25px] md:text-[20px]">Sales Overview</p>
                    <p className="text-[15px] md:text-[11px]">
                      Periodic Sales Overview Analytics
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/reports/sales/sales-overview">
                <div class="px-3 mt-3 bg-[white] py-5 outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex">
                  <div className="flex items-center justify-center w-[50px] h-[50px]">
                    <BsGraphUp size={30} />
                  </div>
                  <div>
                    <p className="text-[25px] md:text-[20px]">
                      Employee Attendence
                    </p>
                    <p className="text-[15px] md:text-[11px]">
                      Periodic Sales Overview Analytics
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
