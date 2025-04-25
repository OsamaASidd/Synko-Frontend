"use client";

import ManageBreakTime from "@/components/employees/attendance/break-time";
import EmployeeDetail from "@/components/employees/attendance/employee-detail";
import EmployeePayroll from "@/components/employees/attendance/employee-payroll";
import EmployeeOverview from "@/components/employees/attendance/overview";
import TodayAttendance from "@/components/employees/attendance/today-report";
import SideMenu from "@/components/menus/SideMenu";
import { GlobalContext } from "@/context";
import { EMPLOYEE_ATTENDANCE } from "@/utils/constants";
import { useContext, useState } from "react";
export default function EmployeeAttendance() {
  const { merchant } = useContext(GlobalContext);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [currentReportPage, setCurrentReportPage] = useState(
    EMPLOYEE_ATTENDANCE.overview
  );

  const GetPage = (props) => {
    return (
      <div>
        <EmployeeOverview
          {...props}
          className={`${
            currentReportPage == EMPLOYEE_ATTENDANCE.overview ? "" : "hidden"
          }`}
        />
        <TodayAttendance
          {...props}
          className={`${
            currentReportPage == EMPLOYEE_ATTENDANCE.today_report
              ? ""
              : "hidden"
          }`}
        />
        <EmployeeDetail
          {...props}
          className={`${
            currentReportPage == EMPLOYEE_ATTENDANCE.employee_report
              ? ""
              : "hidden"
          }`}
        />
        <ManageBreakTime
          {...props}
          className={`${
            currentReportPage == EMPLOYEE_ATTENDANCE.break_time ? "" : "hidden"
          }`}
        />
        <EmployeePayroll
          {...props}
          className={`${
            currentReportPage == EMPLOYEE_ATTENDANCE.employee_payroll
              ? ""
              : "hidden"
          }`}
        />
      </div>
    );
  };

  const reportPagesArray = Object.entries(EMPLOYEE_ATTENDANCE).map(
    ([key, value]) => ({
      key,
      value,
    })
  );
  return (
    <>
      <div className="min-h-screen flex bg-[#171821] relative">
        <SideMenu />
        <div className=" w-[100%] xl:pl-0 xl:w-[80%] overflow-y-auto px-5 xl:px-0 xl:pr-5 py-6 h-screen text-black bg-[#171821]">
          <div className="px-4 md:px-10 rounded-lg py-12 bg-gray-50 h-[calc(100vh-48px)] overflow-y-auto w-[100%]">
            <div className="flex">
              <p className="text-[28px] md:text-[33px] capitalize">
                {currentReportPage || "Employee Attendance"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 mt-[10px] gap-[10px]">
              {reportPagesArray.map(({ key, value }) => {
                if (key == "employee_report") return <></>;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setCurrentReportPage(value);
                    }}
                    className={` ${
                      currentReportPage == value ? "border-[#055938]" : ""
                    } py-[10px] px-[10px] bg-[#ffffff] border-2 rounded-[5px] text-[14px] whitespace-nowrap`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <GetPage
              merchant={merchant}
              currentReportPage={currentReportPage}
              setCurrentReportPage={setCurrentReportPage}
              selectedEmployee={selectedEmployee}
              setSelectedEmployee={setSelectedEmployee}
            />
          </div>
        </div>
      </div>
    </>
  );
}
