"use client";
import SideMenu from "@/components/menus/SideMenu";
import { GlobalContext } from "@/context";
import { useContext, useEffect, useState } from "react";
import { getRequest } from "@/utils/apiFunctions";
import ReportModals from "@/components/reports/ReportModals";
import Tabs from "@/components/Tabs/tabs";
import { useRef } from "react";
import { extractDateTimeInfo } from "@/utils/Dates";
import { IoSearch } from "react-icons/io5";
import { FaFileExport } from "react-icons/fa6";
import { csvDownloader } from "@/utils/csv_downloader";

export default function Reports() {
  const { merchant, user, setMerchant } = useContext(GlobalContext);

  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState("");
  const [startDate, setstartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [query, setQeury] = useState("today");

  // tabs data userState
  const [tabs_heading, setTabs] = useState([
    { value: "OverView", id: 0, selected: true },
    { value: "Today Report", id: 1, selected: false },
  ]);
  const [tab_status, setTabStatus] = useState(0);

  const handleTab = (id) => {
    setsearchByDate("");
    setsearchByMonth("");
    setIsToShow(false);
    setsearchEmploy("");
    setstartDate("");
    if (id == 1) {
      let todayDate = extractDateTimeInfo(new Date());
      let date1 = `${todayDate.year}-${todayDate.month}-${todayDate.day}`; // formate 2024-05-05
      let date2 = `${todayDate.year}-${todayDate.month}-${todayDate.day - 1}`; // formate 2024-05-05
      setsearchByDate(date1);
      setstartDate(date2);
      setEmployeeID("0");
    }

    let temp = tabs_heading.map((item) => {
      setTabStatus(id);
      if (item.id == id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
      return item;
    });
    setTabs(temp);
  };

  const handleDateFromChange = (e) => {
    const newDateFrom = e.target.value;
    setDateFrom(newDateFrom);

    // Set Date To as the same or later
    if (!dateTo || newDateFrom > dateTo) {
      setDateTo(newDateFrom);
    }
  };

  const [modals, setModals] = useState(null);

  const [metaData, setMetaData] = useState({});
  const [employeeList, setEmployeeList] = useState([]);

  const [pageCurrent, setPageCurrent] = useState(1);
  const [searchEmploy, setsearchEmploy] = useState("");

  const handleGetEmployee = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/employees?page=${pageCurrent}&search=${searchEmploy}`
    )
      .then((res) => {
        let array = [];
        if (res?.data?.employees?.data.length > 0) {
          setMetaData(res?.data?.employees?.meta);
          res?.data?.employees?.data.forEach((item, index) => {
            let data = {
              id: item?.id,
              name: item?.name,
              email: item?.email,
              phone_no: item?.phone_no,
            };
            array.push(data);
          });
          if (pageCurrent == 1) {
            setEmployeeList(array);
          } else {
            setEmployeeList((prevData) => {
              return [...prevData, ...array];
            });
          }
        } else {
          setEmployeeList([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error case here
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const [employeeSummary, setemployeeSummary] = useState({});

  const getOverView = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/employees/overview`)
      .then((res) => {
        setemployeeSummary(res?.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error case here
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user !== null && merchant !== null) {
      handleGetEmployee();
      getOverView();
    }
  }, [user, merchant, query, pageCurrent, searchEmploy]);

  // export file in csv
  const exportToCSV = async (e) => {
    if (e === "export_employees") {
      await csvDownloader(employeeList, "EmpoyeeList");
    }
    if (e === "export_attendance") {
      await csvDownloader(employeeAttendanceList, "attendanceList");
    }
  };

  const [searchByDate, setsearchByDate] = useState("");
  const [searchByMonth, setsearchByMonth] = useState("");
  const [selectFilter, setselectFilter] = useState("1");
  const [metaData2, setMetaData2] = useState({});
  const [employeeAttendanceList, setEmployeeAttendanceList] = useState([]);
  const [pageCurrent2, setPageCurrent2] = useState(1);
  const [employeeID, setEmployeeID] = useState("");
  const [isToShow, setIsToShow] = useState(false);
  const targetTableTopCategories = useRef(null);
  const [searchEmploy2, setsearchEmploy2] = useState("");

  function getAttandanceByEmployID() {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/employees/attendance?employee_id=${employeeID}&page=${pageCurrent2}&searchName=${searchEmploy2}&startDate=${startDate}&endDate=${endDate}`
    )
      .then((res) => {
        setMetaData2(res?.data?.meta);

        if (pageCurrent2 == 1) {
          setEmployeeAttendanceList(res?.data?.data);
        } else {
          setEmployeeAttendanceList((prevData) => {
            return [...prevData, ...res?.data?.data];
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error case here
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    if (user !== null && merchant !== null) {
      getAttandanceByEmployID();

      setTimeout(() => {
        if (targetTableTopCategories.current) {
          targetTableTopCategories.current.scrollIntoView({
            behavior: "smooth",
          });
        }
      }, 300);
    }
  }, [
    pageCurrent2,
    employeeID,
    searchByDate,
    searchByMonth,
    searchEmploy2,
    startDate,
    endDate,
  ]);

  const handleSubmitButton = () => {
    if (endDate && startDate && typeof window !== "undefined") {
      getAttandanceByEmployID();
    }
  };

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
            <p className="text-[28px] md:text-[33px]">Employee Attendance</p>
          </div>

          <div className="flex flex-col w-[100%]">
            <hr />

            <div className="flex border-b border-gray-400 mt-5">
              <Tabs action={handleTab} tabs_heading={tabs_heading} />
            </div>

            {tab_status == 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 p-4">
                  <div className="px-3 mt-3 bg-[white] py-5 outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500] flex items-center justify-center flex-col">
                    <span className="font-bold">TOTAL Employees</span>
                    <span>
                      {loading ? ( // Render the loader if isLoading is true
                        <div className="flex items-center justify-center py-2">
                          <div className="animate-spin rounded-full h-7 w-7 border-t-4 border-b-4 border-[#7DE143] to-[#055938]"></div>
                        </div>
                      ) : (
                        <>
                          {employeeSummary?.totalEmploye
                            ? employeeSummary?.totalEmploye
                            : 0}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* sale by dispatch */}
                <div className="text-white text-center p-4 mt-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between">
                  <span className="flex items-center">Exmployees List</span>

                  <div className="flex justify-center items-center ml-2">
                    <input
                      className="border p-2 rounded-[10px] bg-[#F8F8F8]  outline-none text-black mr-2"
                      placeholder="Search Name"
                      value={searchEmploy}
                      onChange={(e) => {
                        setsearchEmploy(e.target.value);
                      }}
                    ></input>

                    <button
                      title="Export in CSV"
                      onClick={() => {
                        exportToCSV("export_employees");
                      }}
                    >
                      <FaFileExport className="text-[20px]" />
                    </button>
                  </div>
                </div>

                <div className="relative overflow-x-auto overflow-y-hidden">
                  {loading ? ( // Render the loader if isLoading is true
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-7 w-7 border-t-4 border-b-4 border-[#7DE143] to-[#055938]"></div>
                    </div>
                  ) : (
                    <>
                      <table className="w-full border text-left">
                        <thead>
                          <tr className="bg-[#055938] text-[#fff]">
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Name
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Email
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Phone
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {employeeList.map((item, index) => {
                            return (
                              <tr
                                key={index}
                                className="border-b bg-white text-[14px]"
                              >
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  <span
                                    className="cursor-pointer"
                                    title="Check Attendance"
                                    onClick={() => {
                                      setEmployeeID(item?.id);
                                      setIsToShow(true);
                                      setPageCurrent2(1);
                                    }}
                                  >
                                    {item?.name}
                                  </span>
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.email}
                                </td>
                                <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                  {item?.phone_no}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </>
                  )}

                  {metaData?.last_page > metaData?.current_page ? (
                    <>
                      <div className="my-[20px] flex justify-center">
                        <button
                          onClick={() => {
                            if (pageCurrent >= metaData?.last_page) {
                              setPageCurrent(pageCurrent);
                              return;
                            }
                            setPageCurrent(pageCurrent + 1);
                          }}
                          className="cursor-pointer px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                        >
                          Load More
                        </button>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </div>

                {/* employee list */}
                {isToShow == true ? (
                  <>
                    <div
                      ref={targetTableTopCategories}
                      className="text-white text-center p-4 mt-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between"
                    >
                      <span className="flex items-center">
                        Exmployees Attendance
                      </span>

                      <div className="flex justify-center items-center ml-2">
                        {/* filter by date */}
                        <div className="flex items-center mr-2 ">
                          <div className="mr-2">Filter By</div>
                          <div className="mr-2">
                            <select
                              id="sort-by"
                              name="sort-by"
                              className="px-4 py-3  border outline-none rounded-lg bg-white text-black ml-2"
                              onChange={(e) => {
                                setselectFilter(e.target.value);
                                setsearchByMonth("");
                                setsearchByDate("");
                                setstartDate("");
                              }}
                              value={selectFilter}
                            >
                              <option value="1">Date</option>
                              <option value="2">Month</option>
                            </select>
                          </div>
                          {selectFilter == "1" ? (
                            <>
                              <div className="text-black">
                                <input
                                  type="date"
                                  value={searchByDate}
                                  onChange={(e) =>
                                    setsearchByDate(e.target.value)
                                  }
                                  className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-black">
                                <input
                                  type="month"
                                  value={searchByMonth}
                                  onChange={(e) =>
                                    setsearchByMonth(e.target.value)
                                  }
                                  className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <button
                          title="Export in CSV"
                          onClick={() => {
                            exportToCSV("export_attendance");
                          }}
                        >
                          <FaFileExport className="text-[20px]" />
                        </button>
                      </div>
                    </div>

                    <div className="relative overflow-x-auto overflow-y-hidden">
                      <table className="w-full border text-left">
                        <thead>
                          <tr className="bg-[#055938] text-[#fff]">
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Name
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Check In Time
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Check Out Time
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Total Hours
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {employeeAttendanceList.length > 0 ? (
                            <>
                              {employeeAttendanceList.map((item, index) => {
                                return (
                                  <tr
                                    key={index}
                                    className="border-b bg-white text-[14px]"
                                  >
                                    <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                      <span>{item?.name}</span>
                                    </td>
                                    <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                      {item?.checkin_time}
                                    </td>
                                    <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                      {item?.checkout_time
                                        ? item?.checkout_time
                                        : "-"}
                                    </td>
                                    <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                      {item?.totalHours != 0
                                        ? item?.totalHours
                                        : "-"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </>
                          ) : (
                            <>
                              <tr>
                                <td colSpan={4} className="text-center">
                                  Now Data Found
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>

                      {metaData2?.last_page > metaData2?.current_page ? (
                        <>
                          <div className="my-[20px] flex justify-center">
                            <button
                              onClick={() => {
                                if (pageCurrent2 >= metaData2?.last_page) {
                                  setPageCurrent2(pageCurrent2);
                                  return;
                                }
                                setPageCurrent2(pageCurrent2 + 1);
                              }}
                              className="cursor-pointer px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                            >
                              Load More
                            </button>
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </>
            ) : (
              ""
            )}

            {tab_status == 1 ? (
              <>
                <div className="flex lg:justify-center">
                  <div className="flex  flex-col  lg:flex-row gap-4 lg:items-center p-3 lg:p-7 justify-center">
                    <div className="flex space-x-4 items-center justify-between w-full lg:w-fit  ">
                      <label className="whitespace-nowrap">Date From</label>
                      <input
                        type="datetime-local"
                        value={startDate}
                        //   onChange={handleDateFromChange}
                        onChange={(e) => setstartDate(e.target.value)}
                        className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                      />
                    </div>

                    <div className="flex space-x-4 items-center justify-between w-full lg:w-fit">
                      <label className="whitespace-nowrap">Date To</label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!startDate && !endDate) {
                          alert("Please select dates to proceed!");
                          return;
                        }
                        handleSubmitButton();
                      }}
                      className="px-[20px] w-fit py-2 lg:p-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-[5px]"
                    >
                      <IoSearch size={20} color="white" />
                    </button>
                  </div>
                </div>
                <div className="text-white text-center p-4 mt-4 bg-gradient-to-r from-[#7DE143] to-[#055938] rounded-10 flex justify-between">
                  <span className="flex items-center">Today Attendance</span>

                  <div className="flex justify-center items-center ml-2">
                    {/* Search By Name */}

                    {/* filter by date */}
                    <div className="flex items-center mr-2 ">
                      {/* {selectFilter == "1" ? (
                        <>

                        </>
                      ) : (
                        <>
                          <div className="text-black">
                            <input
                              type="month"
                              value={searchByMonth}
                              onChange={(e) => setsearchByMonth(e.target.value)}
                              className="bg-[#EFF0F2] py-[6px] px-[10px] rounded-[6px]"
                            />
                          </div>
                        </>
                      )} */}

                      <input
                        className="border p-2 rounded-[10px] bg-[#F8F8F8] outline-none text-black ml-2"
                        placeholder="Search Name"
                        value={searchEmploy2}
                        onChange={(e) => {
                          setsearchEmploy2(e.target.value);
                          setPageCurrent2(1);
                        }}
                      ></input>
                    </div>

                    <button
                      title="Export in CSV"
                      onClick={() => {
                        exportToCSV("export_attendance");
                      }}
                    >
                      <FaFileExport className="text-[20px]" />
                    </button>
                  </div>
                </div>

                <div className="relative overflow-x-auto overflow-y-hidden">
                  {loading ? ( // Render the loader if isLoading is true
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-7 w-7 border-t-4 border-b-4 border-[#7DE143] to-[#055938]"></div>
                    </div>
                  ) : (
                    <>
                      <table className="w-full border text-left">
                        <thead>
                          <tr className="bg-[#055938] text-[#fff]">
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Name
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Check In Time
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Check Out Time
                            </th>
                            <th className="px-7 py-3 text-[16px] font-semibold ">
                              Total Hours
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {employeeAttendanceList.length > 0 ? (
                            <>
                              {employeeAttendanceList.map((item, index) => {
                                return (
                                  <tr
                                    key={index}
                                    className="border-b bg-white text-[14px]"
                                  >
                                    <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                      <span>{item?.name}</span>
                                    </td>
                                    <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                      {item?.checkin_time}
                                    </td>
                                    <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                      {item?.checkout_time
                                        ? item?.checkout_time
                                        : "-"}
                                    </td>
                                    <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                      {item?.totalHours != 0
                                        ? item?.totalHours
                                        : "-"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </>
                          ) : (
                            <>
                              <tr>
                                <td colSpan={4} className="text-center">
                                  Now Data Found
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </>
                  )}

                  {metaData2?.last_page > metaData2?.current_page ? (
                    <>
                      <div className="my-[20px] flex justify-center">
                        <button
                          onClick={() => {
                            if (pageCurrent2 >= metaData2?.last_page) {
                              setPageCurrent2(pageCurrent2);
                              return;
                            }
                            setPageCurrent2(pageCurrent2 + 1);
                          }}
                          className="cursor-pointer px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                        >
                          Load More
                        </button>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
