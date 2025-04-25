import CSpinner from "@/components/common/CSpinner";
import { getRequest } from "@/utils/apiFunctions";
import { EMPLOYEE_ATTENDANCE } from "@/utils/constants";
import { debounce, getErrorMessageFromResponse } from "@/utils/helper";
import { useEffect, useState } from "react";
import { Table } from "rsuite";
import "rsuite/Table/styles/index.css";
const { Column, HeaderCell, Cell } = Table;

export default function EmployeeOverview({
  className,
  merchant,
  setSelectedEmployee,
  setCurrentReportPage,
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [search, setSearch] = useState(null);

  const getData = () => {
    setLoading(true);
    let url = `/merchant/${merchant?.id}/employee`;
    if (search !== null) {
      url = url.concat(`?searchEmployee=${search}`);
    }
    getRequest(url)
      .then((res) => {
        setData(res?.data);
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const getD = debounce(getData, 800);
  useEffect(() => {
    setLoading(true);
    getD();
  }, [search]);

  return (
    <div className={`${className || ""}`}>
      <div className="mt-[20px] flex items-center w-full">
        <input
          type="search"
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          required
          className="border py-2 px-4 w-full sm:w-[300px] rounded-[5px] outline-none"
          placeholder="Search by name"
        />
      </div>
      <div className="mt-[30px]">
        {loading == true ? (
          <div className="min-h-[200px] w-full justify-center items-center flex">
            <CSpinner color="text-black !w-[50px] !h-[50px]" />
          </div>
        ) : (
          <>
            {data && data?.length > 0 ? (
              <>
                <Table
                  autoHeight
                  width="100%"
                  data={data}
                  onRowClick={(rowData) => {
                    setSelectedEmployee(rowData);
                    const pChange = debounce(setCurrentReportPage, 800);
                    pChange(EMPLOYEE_ATTENDANCE.today_report);
                  }}
                >
                  <Column flexGrow={1} minWidth={200}>
                    <HeaderCell>Employee Name</HeaderCell>
                    <Cell className="cursor-pointer" dataKey="name" />
                  </Column>

                  <Column flexGrow={1} minWidth={200}>
                    <HeaderCell>Email</HeaderCell>
                    <Cell className="cursor-pointer" dataKey="email" />
                  </Column>

                  <Column flexGrow={1} minWidth={200}>
                    <HeaderCell>Phone</HeaderCell>
                    <Cell className="cursor-pointer" dataKey="phone_no" />
                  </Column>
                </Table>
              </>
            ) : (
              <></>
            )}
          </>
        )}
      </div>
    </div>
  );
}
