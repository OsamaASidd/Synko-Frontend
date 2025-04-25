"use client";
import React, { useContext, useEffect, useRef } from "react";
import { useState } from "react";
import { GlobalContext } from "@/context";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import Modal from "@/components/modal";
import CSpinner from "@/components/common/CSpinner";
import { getErrorMessageFromResponse } from "@/utils/helper";
import Swal from "sweetalert2";
import useHandleInputs from "@/hooks/useHandleInputs";
import useCustomKeyboardProps from "@/components/ui/custom-keyboard-props";
import { PulseLoader } from "react-spinners";
import Actions from "@/components/ui/action";
const ManageModal = (props) => {
  const { merchant } = useContext(GlobalContext);
  const {
    modelIsOpen,
    setIsModalOpen,
    heading = "Modal",
    operation = "add",
    getDataUrl = "",
    postDataUrl = "",
    setIsDataUpdated,
  } = props;

  const [alert, setAlert] = useState({ type: "danger", message: "" });
  const [loading, setLoading] = useState(false);

  const initialState = {
    total_hours: "",
    total_break_hours: "",
    status: 1,
  };

  const [inputs, handleInputs, setInputs] = useHandleInputs(initialState);

  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/${getDataUrl}`).then((res) => {
      setLoading(false);
      setInputs({
        total_hours: res?.data?.data?.total_hours,
        total_break_hours: res?.data?.data?.total_break_hours,
        status: res?.data?.data?.status,
      });
    });
  };

  const handleSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
    let url = "";
    if (postDataUrl !== "") {
      url = postDataUrl;
    }
    postRequest(
      `/merchant/${merchant?.id}/${url}`,
      inputs,
      operation == "update" ? "put" : "post"
    )
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

  useEffect(() => {
    if (operation == "update" && getDataUrl !== "") {
      getData();
    } else {
      setInputs(initialState);
    }
  }, [operation, getDataUrl]);

  const {
    handleInputFocus,
    handleKeyboardInput,
    isNumericType,
    isVisible,
    keyboardRef,
    keyboardShow,
    os,
    setIsNumericType,
    setKeyboardShow,
  } = useCustomKeyboardProps(inputs, setInputs);

  return (
    <>
      <Modal
        isOpen={modelIsOpen}
        heading={heading}
        onClose={() => {
          setInputs(initialState);
          setIsModalOpen(false);
          setAlert({ type: "danger", message: "" });
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="w-[100%] text-[14px] text-black">
            <div className="flex flex-col space-y-1 pb-3">
              <span>Total Shift Hours*</span>
              <input
                type="number"
                name="total_hours"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                required
                value={inputs?.total_hours ?? ""}
                onChange={handleInputs}
                placeholder="Enter Shift Hour"
              />
            </div>
            <div className="flex flex-col space-y-1 py-3">
              <span>Break Hours*</span>
              <input
                type="number"
                name="total_break_hours"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                required
                value={inputs?.total_break_hours ?? ""}
                onChange={handleInputs}
                placeholder="Enter Break Hour"
              />
            </div>

            <div className="flex flex-col py-3 space-y-1">
              <span>Select Status*</span>
              <select
                name="status"
                onChange={handleInputs}
                placeholder="Select Status"
                className="h-[40px] border-2 rounded-md px-[8px]"
                required
                value={inputs?.status}
              >
                <option value={1}>Active</option>
                <option value={2}>Disable</option>
              </select>
            </div>

            <div className="flex justify-center space-x-4 w-[100%]">
              <button
                type="submit"
                className="w-[70px] px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                disabled={loading == true ? loading : loading}
              >
                {loading == true ? <CSpinner /> : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="border border-black w-[70px] px-3 py-2 rounded-[8px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default function ManageBreakTime({ className }) {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [search, setSearch] = useState("");

  const getData = () => {
    let url = `/merchant/${merchant?.id}/employee-breaks`;

    getRequest(url).then((res) => {
      setPageLevelLoader(false);
      setData(res?.data);
      setIsDataUpdated(false);
    });
  };

  const handleDelete = (id) => {
    setLoading(true);
    setSelectedId(id);
    postRequest(`/merchant/${merchant?.id}/employee-breaks/${id}`, {}, "delete")
      .then((res) => {
        getData();
        Swal.fire({
          text: "Delete Successfully",
          icon: "success",
        });
      })
      .catch((err) => {
        if (err?.response?.data?.messages) {
          for (const [key, value] of Object.entries(
            err.response.data.messages
          )) {
            alert(value[0]);
          }
        } else {
          alert(err?.response?.data?.message);
        }
      })
      .finally(() => {
        setLoading(false);
        setSelectedId(0);
      });
  };

  useEffect(() => {
    if (merchant.id !== undefined && user) getData();
  }, [user, merchant]);
  const [openAction, setIsOpenAction] = useState(null);

  const [dataUpdated, setIsDataUpdated] = useState(null);
  useEffect(() => {
    if (dataUpdated == true) {
      getData();
    }
  }, [dataUpdated]);

  const handleModal = (data) => {
    setIsModalOpen(true);
    setCurrentModalData(data);
  };

  if (pageLevelLoader) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <PulseLoader
          color={"white"}
          loading={pageLevelLoader}
          size={30}
          data-testid="loader"
        />
      </div>
    );
  }
  return (
    <div className={`${className || ""}`}>
      {modelIsOpen == true && (
        <ManageModal
          modelIsOpen={modelIsOpen}
          setIsModalOpen={setIsModalOpen}
          heading={currentModalData?.heading}
          operation={currentModalData?.operation}
          getDataUrl={currentModalData?.getDataUrl}
          postDataUrl={currentModalData?.postDataUrl}
          setIsDataUpdated={setIsDataUpdated}
        />
      )}
      <div className="w-[100%] flex flex-col md:flex-row items-end justify-end py-5 gap-4 md:items-center">
        <button
          onClick={() => {
            handleModal({
              heading: "Manage Break Time",
              operation: "add",
              getDataUrl: "",
              postDataUrl: "employee-breaks",
            });
          }}
          id="shadow"
          className="bg-white px-4 py-2 text-[14px] rounded-[10px] flex space-x-3"
        >
          <img src="/images/Vector1.png" />
          <p>Break Time</p>
        </button>
      </div>

      <div className="mt-[20px]">
        <div className="relative pb-[60px]">
          <table className="w-full border text-left">
            <thead>
              <tr className="bg-[#055938] text-[#ffffff]">
                <th className="px-7 py-3 text-[18px] font-medium">
                  Shift Hours
                </th>
                <th className="px-7 py-3 text-[18px] font-medium">
                  Break Hours
                </th>
                <th className="px-7 py-3 text-[18px] font-medium">Status</th>
                <th className="px-7 py-3 text-[18px] font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td className="px-9 py-2 lg:py-3 whitespace-nowrap">
                    {item.total_hours}
                  </td>
                  <td className="px-9 py-2 lg:py-3 whitespace-nowrap">
                    {item.total_break_hours}
                  </td>
                  <td className="px-7 py-2 lg:py-3 whitespace-nowrap">
                    {item.status === 1 ? (
                      <div className="bg-green-100 text-green-500 px-2 py-1 w-fit text-center rounded-[5px]">
                        Active
                      </div>
                    ) : (
                      <div className="bg-red-100 text-red-500 px-2 py-1 w-fit text-center rounded-[5px]">
                        Disabled
                      </div>
                    )}
                  </td>
                  <td className="px-7 py-2 lg:py-3 whitespace-nowrap">
                    <Actions
                      item={item}
                      navActions={[
                        {
                          title: "Edit",
                          func: () =>
                            handleModal({
                              heading: "Update Break Time",
                              operation: "update",
                              getDataUrl: `employee-breaks/${item.id}`,
                              postDataUrl: `employee-breaks/${item.id}`,
                            }),
                        },
                        {
                          title: "Delete",
                          func: () => handleDelete(item.id),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
