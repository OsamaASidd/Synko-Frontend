"use client";

import CSpinner from "@/components/common/CSpinner";
import Modal from "@/components/modal";
import InputsInfoBox from "@/components/ui/inputs-info-box";
import useHandleInputs from "@/hooks/useHandleInputs";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { getErrorMessageFromResponse } from "@/utils/helper";
import moment from "moment";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function EditAttendance({
  setSelectedRecord,
  selectedRecord,
  isModalOpen,
  setIsModalOpen,
  merchant,
  operation = "add",
  setIsDataUpdated,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const initialState = {
    checkin_time: null,
    checkout_time: null,
    employee_id: selectedRecord?.id,
  };
  const [inputs, handleInputs, setInputs] = useHandleInputs({
    checkin_time: null,
    checkout_time: null,
  });

  const formatDatetime = (datetime) => {
    if (!datetime) return "";
    return moment.utc(datetime).format("YYYY-MM-DDTHH:mm"); // Format as desired
  };

  const getData = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/get-attendance/employee/${selectedRecord?.id}`
    )
      .then((res) => {
        console.log("DATA FROM MODAL");
        console.log(res?.data);
        setLoading(false);
        setInputs({
          checkin_time: formatDatetime(res?.data?.checkin_time),
          checkout_time: formatDatetime(res?.data?.checkout_time),
          employee_id: res?.data?.employee_id,
        });
      })
      .catch((err) => {
        getErrorMessageFromResponse(err);
        setIsModalOpen(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (operation == "update" && selectedRecord?.id) {
      getData();
    } else {
      setInputs(initialState);
    }
  }, [operation, selectedRecord]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    let url = `/merchant/${merchant?.id}/get-attendance/employee/`;
    if (operation == "update") {
      url = url.concat(selectedRecord?.id);
    }
    const method = operation == "add" ? "post" : "put";
    postRequest(url, inputs, method)
      .then((res) => {
        Swal.fire({
          text: res.data.message,
          icon: "success",
        });
        event.target.reset();
        setInputs(operation == "update" ? res.data.data : initialState);
        setIsDataUpdated(true);
        setIsModalOpen(false);
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };

  console.log("CHECK DATE TIME");
  console.log(data);
  return (
    <>
      <Modal
        isOpen={isModalOpen}
        heading={operation == "add" ? "Add Attendance" : "Update Attendance"}
        onClose={() => {
          setInputs(initialState);
          setIsModalOpen(false);
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="w-[100%] text-[14px] text-black flex flex-col gap-y-[10px]">
            <div className="flex flex-col space-y-1">
              <span>Employee Name</span>
              <input
                type="text"
                disabled
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                value={
                  operation == "update"
                    ? selectedRecord?.employee?.name
                    : selectedRecord?.name
                }
                placeholder="Employee Name"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <span>CheckIn DateTime</span>
              <input
                type="datetime-local"
                name="checkin_time"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                value={inputs?.checkin_time || null}
                onChange={handleInputs}
                placeholder="Enter CheckIn DateTime"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <span>CheckOut DateTime</span>
              <input
                type="datetime-local"
                name="checkout_time"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                value={inputs?.checkout_time || null}
                onChange={handleInputs}
                placeholder="Enter CheckOut DateTime"
              />
            </div>
            <div className="flex justify-center space-x-4 w-[100%]">
              <button
                type="submit"
                className="w-[70px] px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                disabled={loading == true ? loading : loading}
              >
                {loading == true ? <CSpinner /> : "Save"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
