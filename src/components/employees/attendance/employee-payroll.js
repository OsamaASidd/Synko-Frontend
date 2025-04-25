import CSpinner from "@/components/common/CSpinner";
import NoData from "@/components/reporting/no-data";
import CustomDateRangePicker from "@/components/ui/custom-date-range-picker";
import CustomTimeRangePicker from "@/components/ui/custom-time-range-picker";
import { getRequest } from "@/utils/apiFunctions";
import {
  debounce,
  formatToMySQLDate,
  getErrorMessageFromResponse,
} from "@/utils/helper";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaFileExport, FaSearch } from "react-icons/fa";
import { Table } from "rsuite";
import "rsuite/Table/styles/index.css";
import format from "date-fns/format";
import { IoClose } from "react-icons/io5";
import InputsInfoBox from "@/components/ui/inputs-info-box";
import EditAttendance from "./edit-attendance";
import {
  csvDownloader,
  csvDownloaderNew,
  getExportCSVData,
} from "@/utils/csv_downloader";
import Button from "@/components/ui/button";
import { IoMdAdd } from "react-icons/io";
const { Column, HeaderCell, Cell } = Table;

export default function EmployeePayroll({
  className,
  merchant,
  selectedEmployee,
  setSelectedEmployee,
}) {
  const [exportLoading, setExportLoading] = useState(false);
  const [isDataUpdated, setIsDataUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [exportData, setExportData] = useState([]);
  const [totalPayableMinutes, setTotalPayableMinutes] = useState(0);
  const [totalWorkingMinutes, setTotalWorkingMinutes] = useState(0);
  const [totalBreakMinutes, setTotalBreakMinutes] = useState(0);

  const [modalOperation, setModalOperation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(false);
  const [isBreakNull, setBreakNull] = useState(false);

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
  const [timeRange, setTimeRange] = useState(null);
  const handleTimeRangeChange = (range) => {
    if (range && range.length === 2) {
      const [start, end] = range;
      const formattedStart = format(start, "HH:mm:ss");
      const formattedEnd = format(end, "HH:mm:ss");
      setTimeRange({ timeStart: formattedStart, timeEnd: formattedEnd });
      // if (onTimeRangeChange) {
      //   onTimeRangeChange({ start: formattedStart, end: formattedEnd });
      // }
    } else {
      setTimeRange(null);
    }
  };

  const calculatePayableTime = (totalMinutes) => {
    let adjustedMinutes = totalMinutes;
    if (totalMinutes >= 20 * 60) {
      adjustedMinutes -= Math.floor(totalMinutes / (20 * 60)) * 120;
    } else if (totalMinutes >= 16 * 60) {
      adjustedMinutes -= Math.floor(totalMinutes / (16 * 60)) * 90;
    } else if (totalMinutes >= 10 * 60) {
      adjustedMinutes -= Math.floor(totalMinutes / (10 * 60)) * 60;
    } else if (totalMinutes >= 6 * 60) {
      adjustedMinutes -= Math.floor(totalMinutes / (6 * 60)) * 30;
    }
    return adjustedMinutes;
  };

  const calculateBreakTime = (totalMinutes) => {
    let breakMinutes = 0;
    if (totalMinutes >= 20 * 60) {
      breakMinutes = Math.floor(totalMinutes / (20 * 60)) * 120;
    } else if (totalMinutes >= 16 * 60) {
      breakMinutes = Math.floor(totalMinutes / (16 * 60)) * 90;
    } else if (totalMinutes >= 10 * 60) {
      breakMinutes = Math.floor(totalMinutes / (10 * 60)) * 60;
    } else if (totalMinutes >= 6 * 60) {
      breakMinutes = Math.floor(totalMinutes / (6 * 60)) * 30;
    }
    return breakMinutes;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getData = () => {
    setLoading(true);
    let url = `/merchant/${merchant?.id}/get-employee-payroll/employee?dateFrom=${dateRange[0]}&dateTo=${dateRange[1]}`;
    if (timeRange?.timeStart && timeRange?.timeEnd) {
      url = url.concat(
        `&timeStart=${timeRange?.timeStart}&timeEnd=${timeRange?.timeEnd}`
      );
    }
    if (selectedEmployee) {
      url = url.concat(`&employee_id=${selectedEmployee?.id}`);
    }
    getRequest(url)
      .then((res) => {
        setData(res?.data);
        if (res?.data && res?.data?.length > 0) {
          const formattedData = res?.data?.map((row) => ({
            "Employee Name": row?.name || "--",
            "Total Working Time": formatTime(row.total_working_time),
            "Total Payable Time": formatTime(row.total_payable_time),
            "Total Break Time": formatTime(row.total_break_time),
          }));
          setExportData([...formattedData]);
        }
        if (selectedEmployee && res?.data?.length > 0) {
          // Calculate totals
          let workingMinutes = 0;
          let breakMinutes = 0;
          let payableMinutes = 0;

          res?.data?.forEach((row) => {
            workingMinutes += +row.adjusted_minutes;
            breakMinutes += +row.break_minutes;
            payableMinutes += +row.break_minutes + +row.adjusted_minutes;
          });
          setTotalWorkingMinutes(workingMinutes);
          setTotalBreakMinutes(breakMinutes);
          setTotalPayableMinutes(payableMinutes);
        }
      })
      .catch((err) => {
        if (err.response.data.message == "Please Add Break time") {
          setBreakNull(true);
        } else {
          getErrorMessageFromResponse(err);
        }
      })
      .finally(() => {
        setLoading(false);
        setIsDataUpdated(false);
      });
  };

  const handleSearchButton = () => {
    if (merchant?.id && dateRange) {
      getData();
    }
  };

  const gData = debounce(getData, 800);
  useEffect(() => {
    if (merchant?.id && dateRange) {
      setLoading(true);
      gData();
    }
  }, [dateRange, timeRange, selectedEmployee]);

  useEffect(() => {
    if (isDataUpdated == true) {
      getData();
    }
  }, [isDataUpdated]);

  const TotalWorkingTimeCell = ({ rowData, dataKey, ...props }) => {
    const totalMinutes = rowData?.total_working_time;
    let adjustedMinutes = totalMinutes;
    return <Cell {...props}>{formatTime(adjustedMinutes)}</Cell>;
  };

  const TotalBreakTimeCell = ({ rowData, dataKey, ...props }) => {
    const totalMinutes = rowData?.total_break_time;
    let adjustedMinutes = totalMinutes;

    // let breakMinutes = 0;

    // if (totalMinutes >= 20 * 60) {
    //   breakMinutes = Math.floor(totalMinutes / (20 * 60)) * 120;
    // } else if (totalMinutes >= 16 * 60) {
    //   breakMinutes = Math.floor(totalMinutes / (16 * 60)) * 90;
    // } else if (totalMinutes >= 10 * 60) {
    //   breakMinutes = Math.floor(totalMinutes / (10 * 60)) * 60;
    // } else if (totalMinutes >= 6 * 60) {
    //   breakMinutes = Math.floor(totalMinutes / (6 * 60)) * 30;
    // }

    return <Cell {...props}>{formatTime(adjustedMinutes)}</Cell>;
  };

  const TotalPayableTimeCell = ({ rowData, dataKey, ...props }) => {
    const totalMinutes = rowData?.total_payable_time;
    let adjustedMinutes = totalMinutes;

    // if (totalMinutes >= 20 * 60) {
    //   adjustedMinutes -= Math.floor(totalMinutes / (20 * 60)) * 120;
    // } else if (totalMinutes >= 16 * 60) {
    //   adjustedMinutes -= Math.floor(totalMinutes / (16 * 60)) * 90;
    // } else if (totalMinutes >= 10 * 60) {
    //   adjustedMinutes -= Math.floor(totalMinutes / (10 * 60)) * 60;
    // } else if (totalMinutes >= 6 * 60) {
    //   adjustedMinutes -= Math.floor(totalMinutes / (6 * 60)) * 30;
    // }

    return <Cell {...props}>{formatTime(adjustedMinutes)}</Cell>;
  };

  const EmployeeName = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>{rowData.name ? `${rowData?.name}` : "--"}</Cell>
  );

  const CheckTime = ({ rowData, dataKey, ...props }) => {
    return (
      <Cell {...props}>
        {rowData[dataKey]
          ? `${moment.utc(rowData[dataKey]).format("LT, MMM DD, YYYY")}`
          : rowData[dataKey]}
      </Cell>
    );
  };

  const ExportButton = ({ name = null }) => {
    return (
      <Button
        onClick={() => {
          if (exportLoading == true) return;
          csvDownloaderNew(
            exportData,
            `attendance_report${name ? `_${name}` : ""}_${moment
              .utc(dateRange[0])
              .format("MMM-D-YYYY")}_${moment
              .utc(dateRange[1])
              .format("MMM-D-YYYY")}`
          );
        }}
      >
        {exportLoading == true ? (
          <>
            <CSpinner color="text-[#055938]" />
          </>
        ) : (
          <FaFileExport color="#055938" />
        )}
      </Button>
    );
  };

  return (
    <div className={`${className || ""}`}>
      {isModalOpen == true &&
      (modalOperation == "add" || modalOperation == "update") ? (
        <>
          <EditAttendance
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            selectedRecord={selectedRecord}
            setSelectedRecord={setSelectedRecord}
            merchant={merchant}
            operation={modalOperation}
            setIsDataUpdated={setIsDataUpdated}
          />
        </>
      ) : null}
      {isBreakNull && (
        <p className="text-red-600 pt-2"> Please Add Break time</p>
      )}
      <div className="mt-[20px] flex gap-x-2 md:gap-x-[20px] items-center w-full">
        <CustomDateRangePicker onChange={handleDateRangeChange} />
        <CustomTimeRangePicker onChange={handleTimeRangeChange} />
        <div className="flex justify-center items-center">
          <button
            className="pt-2 pb-2 pl-4 pr-4 bg-gradient-to-r from-[#7DE143] to-[#055938] font-bold rounded-lg text-white text-center"
            onClick={() => {
              handleSearchButton();
            }}
            disabled={loading}
          >
            {loading == true ? (
              <>
                <CSpinner color="text-white" />
              </>
            ) : (
              <FaSearch />
            )}
          </button>
        </div>
      </div>

      {selectedEmployee ? (
        <>
          <div className="mt-[20px] flex justify-between w-full items-center">
            <div className="flex gap-x-[6px]">
              <div>{selectedEmployee?.name}</div>
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                }}
              >
                <IoClose color="red" />
              </button>
            </div>
            {/* <div className="flex justify-center items-center gap-x-[10px]">
              <ExportButton name={selectedEmployee?.name} />
              <Button
                onClick={() => {
                  setSelectedRecord(selectedEmployee);
                  setModalOperation("add");
                  const changeData = debounce(setIsModalOpen, 500);
                  changeData(true);
                }}
              >
                <IoMdAdd fontWeight={600} />
              </Button>
            </div> */}
          </div>
        </>
      ) : null}

      {selectedEmployee ? (
        <div className="mt-[20px] flex flex-col md:flex-row gap-[20px]">
          <InputsInfoBox title={"Total Working Time"}>
            {formatTime(totalPayableMinutes)}
          </InputsInfoBox>
          <InputsInfoBox title={"Total Payable Time"}>
            {formatTime(totalWorkingMinutes)}
          </InputsInfoBox>
          <InputsInfoBox title={"Total Break Time"}>
            {formatTime(totalBreakMinutes)}
          </InputsInfoBox>
        </div>
      ) : null}

      <div className="mt-[20px]">
        {loading == true ? (
          <div className="min-h-[200px] w-full justify-center items-center flex">
            <CSpinner color="text-black !w-[50px] !h-[50px]" />
          </div>
        ) : (
          <>
            {!data ? (
              <NoData>
                <h2 className="font-[500] text-[16px]">
                  No Record in This Time Frame
                </h2>
                <p className="text-[12px]">
                  No records took place during the time frame you selected.
                </p>
              </NoData>
            ) : (
              <>
                {data && data?.length > 0 ? (
                  <div className="flex justify-end mb-[10px]">
                    <ExportButton />
                  </div>
                ) : null}
                <Table
                  autoHeight
                  width="100%"
                  data={data}
                  onRowClick={(rowData) => {}}
                >
                  <Column flexGrow={1} Width={200}>
                    <HeaderCell>Employee Name</HeaderCell>
                    <EmployeeName dataKey="name" />
                  </Column>

                  <Column flexGrow={1} width={150}>
                    <HeaderCell>Total Working Time</HeaderCell>
                    <TotalWorkingTimeCell dataKey="total_working_time" />
                  </Column>

                  <Column flexGrow={1} width={150}>
                    <HeaderCell>Total Payable Time</HeaderCell>
                    <TotalPayableTimeCell dataKey="total_payable_time" />
                  </Column>

                  <Column flexGrow={1} width={150}>
                    <HeaderCell>Total Break Time</HeaderCell>
                    <TotalBreakTimeCell dataKey="total_minutes" />
                  </Column>

                  {/* <Column flexGrow={1} width={80}>
                    <HeaderCell>...</HeaderCell>

                    <Cell style={{ padding: "6px" }}>
                      {(rowData) => (
                        <button
                          appearance="link"
                          onClick={() => {
                            setSelectedRecord(rowData);
                            setModalOperation("update");
                            const changeData = debounce(setIsModalOpen, 500);
                            changeData(true);
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </Cell>
                  </Column> */}
                </Table>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
