"use client";

import React, { useContext, useEffect, useState } from "react";
import SideMenu from "@/components/menus/SideMenu";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRequest } from "@/utils/apiFunctions";
import jsPDF from "jspdf";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  FILTERS,
  formatToMySQLDate,
  getErrorMessageFromResponse,
} from "@/utils/helper";
import { GlobalContext } from "@/context";
import CustomDateRangePicker from "@/components/ui/custom-date-range-picker";
import { format } from "date-fns";

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AnalyticsPage() {
  const [aiResponse, setAiResponse] = useState(null);
  const [detailedSalesReport, setDetailedSalesReport] = useState(null);
  const [orderWeekDay, setOrderWeekDay] = useState([]);
  const [orderTime, setOrderTime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [LeastSellingItems, setLeastSellingItems] = useState([]);
  const [NonSellingItems, setNonSellingItems] = useState([]);
  const [TopTrendingItems, setTopTrendingItems] = useState([]);
  const [TopTrendingCategory, setTopTrendingCategory] = useState([]);
  const [salesData, setSalesData] = useState({
    total_net_sales: 0,
    total_orders: 0,
    total_cash_orders: 0,
    total_card_orders: 0,
    total_foc_orders: 0,
    total_takeaway_orders: 0,
    total_dine_in_orders: 0,
    total_delivery_orders: 0,
    cash_total_amount: 0,
    card_total_amount: 0,
    total_takeaway_order_amount: 0,
    total_dine_in_order_amount: 0,
    total_delivery_order_amount: 0,
  });
  const [showBarChart, setShowBarChart] = useState(false);
  const [showPieChart, setShowPieChart] = useState(false);

  const apiKey = "AIzaSyBVxbVAVbeH20QHoiie7UKoabYAYORwmMw"; // Replace with your actual API key
  const genAI = new GoogleGenerativeAI(apiKey);

  const [dateRange, setDateRange] = useState([
    formatToMySQLDate(new Date()),
    formatToMySQLDate(new Date()),
  ]);

  const handleDateRangeChange = (range) => {
    if (range && range.length > 0) {
      const fromDate = new Date(range[0]);
      const toDate = new Date(range[1]);

      const formattedFromDate = formatToMySQLDate(fromDate);
      const formattedToDate = formatToMySQLDate(toDate);

      setDateRange([formattedFromDate, formattedToDate]);
    }
  };
  const { merchant } = useContext(GlobalContext);
  const [timeRange, setTimeRange] = useState(null);
  const handleTimeRangeChange = (range) => {
    if (range && range.length === 2) {
      const [start, end] = range;
      const formattedStart = format(start, "HH:mm:ss");
      const formattedEnd = format(end, "HH:mm:ss");
      setTimeRange({ timeStart: formattedStart, timeEnd: formattedEnd });
    }
  };

  console.log(LeastSellingItems);
  console.log(NonSellingItems);
  const getordertime = async () => {
    let url;
    url = `/merchant/${merchant?.id}/get_data_for_ai`;
    getRequest(url)
      .then((res) => {
        // console.log(res);
        setNonSellingItems(
          res.data.nonSellingItems.map((menuItems) => menuItems?.name)
        );
        setLeastSellingItems(
          res.data.leastSoldItems.map((menuItems) => menuItems?.name)
        );
        const formattedDates = res.data.map((item) => {
          // Format the date to get the weekday
          const date = new Date(item);
          const dayOfWeek = date.getDay();
          const weekday = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ][dayOfWeek];

          return {
            formattedTime: format(item, "hh:mm a"),
            weekday: weekday,
          };
        });

        setOrderTime(formattedDates.map((item) => item.formattedTime));
        setOrderWeekDay(formattedDates.map((item) => item.weekday));
      })
      .catch((err) => {
        console.log(err);
      })
      .finally();
  };
  // console.log(TopTrendingCategory);
  const getData = async () => {
    let url;
    url = `/merchant/${merchant?.id}/get_dashboard_sales?filter=${FILTERS.sales_report}&dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}`;
    getRequest(url)
      .then((res) => {
        // console.log(res);
        setTopTrendingCategory(
          res.data.categorySales.map(
            (menu_category) => menu_category?.menu_category_name
          )
        );
        setTopTrendingItems(
          res.data.itemSales.map((menuItems) => menuItems?.menu_item_name)
        );
        setSalesData(res.data.orderData);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally();
  };

  const cardPercent =
    (salesData?.total_card_orders * 100) / salesData.total_orders;
  const cashPercent =
    (salesData?.total_cash_orders * 100) / salesData.total_orders;
  const focPercent =
    (salesData?.total_foc_orders * 100) / salesData.total_orders;

  const averageAmount =
    salesData?.total_orders > 0
      ? salesData?.total_net_sales / salesData?.total_orders
      : 0;

  useEffect(() => {
    getData();
  }, [dateRange]);
  useEffect(() => {
    getordertime();
  }, [dateRange]);

  const callGoogleGenerativeAI = async () => {
    setLoading(true);
    setError(null);

    try {
      const prompt = `
Analyze the provided POS data to generate a comprehensive business report. The report should cover the following sections and provide detailed insights, tables, and strategies.

# Performance Overview:
Summarize key performance metrics with a table format:
| **Metric**                 | **Value**                              |
|----------------------------|----------------------------------------| 
| **Total Sales**             | ${merchant?.currency?.symbol ?? "€"}${
        salesData?.total_net_sales
      }         |
| **Avg Transaction Amount**  | ${
        merchant?.currency?.symbol ?? "€"
      }${averageAmount}                      |
| **Total Orders**            | ${salesData?.total_orders}             |
| **Payment Methods**         |                                        |
| - Cash                      | ${salesData?.total_cash_orders} (${
        merchant?.currency?.symbol ?? "€"
      }${salesData?.cash_total_amount}) |
| - Card                      | ${salesData?.total_card_orders} (${
        merchant?.currency?.symbol ?? "€"
      }${salesData?.card_total_amount}) |
| - FOC                       | ${salesData?.total_foc_orders}         |
| **Order Types**             |                                        |
| - Takeaway                  | ${salesData?.total_takeaway_orders} (${
        merchant?.currency?.symbol ?? "€"
      }${salesData?.total_takeaway_order_amount}) |
| - Dine-In                   | ${salesData?.total_dine_in_orders} (${
        merchant?.currency?.symbol ?? "€"
      }${salesData?.total_dine_in_order_amount})   |
| - Delivery                  | ${salesData?.total_delivery_orders} (${
        merchant?.currency?.symbol ?? "€"
      }${salesData?.total_delivery_order_amount}) |

# Peak Times:
Highlight peak days and hours:
- **Days**: ${orderWeekDay.join(", ")}
- **Hours**: ${orderTime.join(", ")}

# Top-Selling Items & Categories Analysis:
- **Top Items**: ${TopTrendingItems.join(", ")}
  - Explain why these items are popular (e.g., promotions, seasonal demand).
- **Top Category**: ${TopTrendingCategory.join(", ")}
  - Assess the impact on overall sales.
  - Identify high-performing items in **Dine-In**, **Delivery**, and **Takeaway**.
  - Suggest strategies to maintain momentum and promote other menu items.

# Least-Selling and Non-Selling Items Analysis:
- **Least-Selling Items**: ${LeastSellingItems.join(", ")}
- **Non-Selling Items**: ${NonSellingItems.join(", ")}
  - Identify potential causes (e.g., pricing, visibility, awareness).
  - Propose strategies to enhance their performance (e.g., promotions, repositioning).

# Business Insights and Recommendations:
- Provide targeted recommendations to improve sales for **Takeaway**, **Dine-In**, and **Delivery**.
- Discuss trends in **Payment Methods** and **Order Types**.
- Suggest **bundling** top-selling items with underperforming ones.
- Outline **pricing strategies** for least-selling items.

# Sales Boost Strategies:
- Implement **promotions**: Limited-time offers, bundles, happy hours.
- Introduce **loyalty rewards** for purchasing underperforming items.
- Launch **marketing campaigns** on social media for least-selling items.
- Adjust offerings based on **seasonal trends**.
- Train staff to promote least-selling items proactively.

# AI-Generated Deal Suggestions:
- Create **combo deals**: Top-sellers with least-sellers.
- Offer **happy hour discounts** during off-peak hours.
- Develop **day-specific promotions** to drive sales on slow days.
- Implement a **loyalty program** focusing on underperforming items.

# Detailed Analysis:
- Assess the effectiveness of proposed strategies using historical data trends.
- Recommend methods for reintroducing non-selling items into the menu with improved visibility.
`;

      const generationConfig = {
        stopSequences: ["green"],
        maxOutputTokens: 300,
        temperature: 50,
        topP: 10,
        topK: 106,
      };

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-002" });
      const result = await model.generateContent(prompt, generationConfig);

      if (result?.response?.candidates?.length > 0) {
        const content = result.response.candidates[0].content.parts[0].text;
        setAiResponse(content);
      } else {
        throw new Error("No candidates found in the response.");
      }
    } catch (err) {
      console.log(err);
      setError("Error generating content. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (content, title) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 10, 10);
    doc.setFontSize(12);

    const lines = doc.splitTextToSize(content, 180);
    let y = 20;

    lines.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      doc.text(line, 10, y);
      y += 10;
    });

    doc.save(`${title}.pdf`);
  };

  const barData = {
    labels: [
      "Total Sales",
      "Number of Orders",
      "Cash Orders",
      "Card Orders",
      "Takeaway Orders",
      "Dine-In Orders",
      "Delivery Orders",
    ],
    datasets: [
      {
        label: "Sales and Orders Overview",
        data: [
          salesData?.total_net_sales,
          salesData?.total_orders,
          salesData?.total_cash_orders,
          salesData?.total_card_orders,
          salesData?.total_takeaway_orders,
          salesData?.total_dine_in_orders,
          salesData?.total_delivery_orders,
        ],
        backgroundColor: [
          "#13B497",
          "#FF5E57",
          "#FFC312",
          "#C4E538",
          "#12CBC4",
          "#FDA7DF",
          "#ED4C67",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ["Takeaway", "Dine-In", "Delivery"],
    datasets: [
      {
        label: "Order Type Breakdown",
        data: [
          salesData?.total_takeaway_orders,
          salesData?.total_dine_in_orders,
          salesData?.total_delivery_orders,
        ],
        backgroundColor: ["#17D69F", "#15BFC0", "#1597C0"],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="min-h-screen flex bg-[#171821] gap-x-[18px] relative">
      <SideMenu />
      <div className="w-[100%] px-16 xl:pl-0 xl:w-[80%] overflow-y-auto pr-5 py-6 h-screen bg-[#171821]">
        <div className="px-4 md:px-10 rounded-lg py-12 bg-gray-50 min-h-screen w-[100%]">
          <div className="flex">
            <p className="text-[22px] font-semibold font-[Poppins, sans-serif] text-[#171821]">
              Analytics Report
            </p>
          </div>
          <CustomDateRangePicker onChange={handleDateRangeChange} />
          <div className="mt-[30px]">
            <h3 className="text-[22px] font-semibold mb-4 font-[Poppins, sans-serif] text-[#171821]">
              Sales Summary
            </h3>
            <table className="min-w-full bg-white rounded-md overflow-hidden shadow-lg">
              <thead className="bg-gradient-to-r from-[#13AAE0] to-[#18D89D] text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Metric</th>
                  <th className="px-4 py-2 text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Total Sales
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {merchant?.currency?.symbol ?? "€"}{" "}
                    {salesData?.total_net_sales}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Average Transaction Amount
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {merchant?.currency?.symbol ?? "€"}{" "}
                    {averageAmount.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Number of Orders
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {salesData?.total_orders}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Cash Orders
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {salesData?.total_cash_orders}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Card Orders
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {salesData?.total_card_orders}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    FOC Orders
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {salesData?.total_foc_orders}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Takeaway Orders
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {salesData?.total_takeaway_orders}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Dine-In Orders
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {salesData?.total_dine_in_orders}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Delivery Orders
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {salesData?.total_delivery_orders}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Cash Order Amount
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {merchant?.currency?.symbol ?? "€"}{" "}
                    {salesData?.cash_total_amount}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Card Order Amount
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {merchant?.currency?.symbol ?? "€"}{" "}
                    {salesData?.card_total_amount}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Takeaway Amount
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {merchant?.currency?.symbol ?? "€"}{" "}
                    {salesData?.total_takeaway_order_amount}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Dine-In Amount
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {merchant?.currency?.symbol ?? "€"}{" "}
                    {salesData?.total_dine_in_order_amount}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Delivery Amount
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {merchant?.currency?.symbol ?? "€"}{" "}
                    {salesData?.total_delivery_order_amount}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Top Trending Items
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {TopTrendingItems.map((item, index) => (
                      <p key={index}>{item}</p>
                    ))}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Top Trending Categories
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {TopTrendingCategory.map((item, index) => (
                      <p key={index}>{item}</p>
                    ))}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Least Selling Items
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {LeastSellingItems.map((item, index) => (
                      <p key={index}>{item}</p>
                    ))}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    Non Selling Items
                  </td>
                  <td className="px-4 py-2 text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                    {NonSellingItems.map((item, index) => (
                      <p key={index}>{item}</p>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-[30px]">
            <button
              className="py-2 px-4 bg-gradient-to-r from-[#13AAE0] to-[#18D89D] text-white rounded"
              onClick={callGoogleGenerativeAI}
              disabled={loading}
            >
              {loading ? "Loading..." : "Generate AI Insights"}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {aiResponse && (
              <div className="mt-4">
                <h3 className="text-[22px] font-semibold font-[Poppins, sans-serif] text-[#171821]">
                  AI Insights:
                </h3>
                <div className="bg-gray-100 p-4 rounded-md mt-2 shadow-md text-[#545353] text-[16px] font-[Poppins, sans-serif]">
                  <pre className="whitespace-pre-wrap">{aiResponse}</pre>
                </div>
                <button
                  className="mt-4 py-2 px-4 bg-gradient-to-r from-[#13AAE0] to-[#18D89D] text-white rounded"
                  onClick={() => downloadPDF(aiResponse, "AI Insights")}
                >
                  Download AI Insights as PDF
                </button>
              </div>
            )}
          </div>

          {/* Charts Display */}
          <div className="flex flex-wrap justify-between items-start mt-[30px] gap-8">
            {/* Bar Chart */}
            <div className="w-full lg:w-[48%] bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Sales by Payment Method
              </h2>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-600">Total Orders:</h3>
                <span className="text-lg text-gray-800">
                  {salesData.total_orders}
                </span>
              </div>

              <div className="flex justify-around w-full mt-6">
                {/* Cash Orders Bar */}
                <div className="flex flex-col items-center w-[28%] gap-y-3">
                  <div className="w-full h-[300px] flex items-end border border-gray-300 rounded-lg">
                    <div
                      style={{ height: `${cashPercent}%` }}
                      className="bg-[#17D69F] w-full rounded-lg"
                    ></div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">Cash</p>
                    <p className="text-xs text-gray-600">
                      ({salesData.total_cash_orders})
                    </p>
                    <p className="text-xs text-gray-600">
                      Percentage: {cashPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Card Orders Bar */}
                <div className="flex flex-col items-center w-[28%] gap-y-3">
                  <div className="w-full h-[300px] flex items-end border border-gray-300 rounded-lg">
                    <div
                      style={{ height: `${cardPercent}%` }}
                      className="bg-[#15BFC0] w-full rounded-lg"
                    ></div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">Card</p>
                    <p className="text-xs text-gray-600">
                      ({salesData.total_card_orders})
                    </p>
                    <p className="text-xs text-gray-600">
                      Percentage: {cardPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Other Orders Bar */}
                <div className="flex flex-col items-center w-[28%] gap-y-3">
                  <div className="w-full h-[300px] flex items-end border border-gray-300 rounded-lg">
                    <div
                      style={{ height: `${focPercent}%` }}
                      className="bg-[#1597C0] w-full rounded-lg"
                    ></div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">Other</p>
                    <p className="text-xs text-gray-600">
                      ({salesData.total_foc_orders})
                    </p>
                    <p className="text-xs text-gray-600">
                      Percentage: {focPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="w-full lg:w-[48%] bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Sales Distribution</h2>
              <div className="w-full h-[300px] sm:w-[350px] sm:h-[350px] lg:w-[435px] lg:h-[420px] mx-auto">
                {" "}
                {/* Responsive width and height */}
                <Pie data={pieData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
