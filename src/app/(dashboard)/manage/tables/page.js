"use client";
import React, { useContext, useEffect, useRef } from "react";
import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { GlobalContext } from "@/context";
import SideMenu from "@/components/menus/SideMenu";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { PulseLoader } from "react-spinners";
import Modal from "@/components/modal";
import CSpinner from "@/components/common/CSpinner";
import CAlert from "@/components/common/CAlert";
import { getErrorMessageFromResponse } from "@/utils/helper";
import Swal from "sweetalert2";
import ProtectedRoute from "@/components/protected-route";
import { useRouter } from "next/navigation";
import Actions from "@/components/ui/action";
import useHandleInputs from "@/hooks/useHandleInputs";
import useDeviceVisibility from "@/hooks/useDeviceVisibility";
import CustomKeyboard from "@/components/ui/custom-keyboard";
import useCustomKeyboardProps from "@/components/ui/custom-keyboard-props";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
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
    number: "",
    seating_capacity: 1,
    status: 1,
    name: "",
  };

  const [inputs, handleInputs, setInputs] = useHandleInputs(initialState);
  const [data, setData] = useState(null);
  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/${getDataUrl}`).then((res) => {
      setLoading(false);
      setData(res?.data);
      setInputs({
        number: res?.data?.number,
        seating_capacity: res?.data?.seating_capacity,
        status: res?.data?.status,
        name: res?.data?.name,
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

  // const qrRef = useRef(); // Reference to access the QR code element

  // const handleDownload = () => {
  //   const svg = qrRef.current.querySelector("svg"); // Get the SVG element
  //   const svgData = new XMLSerializer().serializeToString(svg); // Serialize the SVG content to a string
  //   const blob = new Blob([svgData], { type: "image/svg+xml" }); // Create a Blob from the SVG data
  //   const link = document.createElement("a"); // Create a link element
  //   link.href = URL.createObjectURL(blob); // Create a download URL for the Blob
  //   link.download = `synko-table-${data?.number}.svg`; // Set the file name for the download
  //   link.click(); // Trigger the download by simulating a click on the link
  // };

  const [pixelSize, setPixelSize] = useState(256); // Default pixel size
  const qrRef = useRef();

  const handleDownload = async () => {
    if (qrRef.current) {
      const element = qrRef.current; // Select the full div
      element.classList.remove("hidden");

      // Generate canvas from the div
      const divCanvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        backgroundColor: null, // Transparent background
        useCORS: true, // Ensures external images load
      });

      // Create a final canvas to merge the QR code
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = divCanvas.width;
      finalCanvas.height = divCanvas.height;
      const ctx = finalCanvas.getContext("2d");

      // Draw the div's content first
      ctx.drawImage(divCanvas, 0, 0);

      // Find the QR code's canvas and overlay it
      // const qrCanvas = element.querySelector("canvas");
      // if (qrCanvas) {
      //   const qrX = (divCanvas.width - qrCanvas.width * 2) / 2; // Adjust X position
      //   const qrY = divCanvas.height / 3; // Adjust Y position
      //   ctx.drawImage(
      //     qrCanvas,
      //     qrX,
      //     qrY,
      //     qrCanvas.width * 2,
      //     qrCanvas.height * 2
      //   );
      // }

      // Convert the merged canvas to an image and download it
      const pngUrl = finalCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `synko-table-${data?.number}_${pixelSize}x${pixelSize}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      element.classList.add("hidden");
    }
  };

  // const handleDownload = async () => {
  //   if (qrRef.current) {
  //     const element = qrRef.current; // Select the whole div
  //     const canvas = await html2canvas(element, {
  //       scale: 2, // Higher scale for better resolution
  //       backgroundColor: null, // Maintain transparent background
  //       useCORS: true, // Prevent CORS issues
  //     });

  //     const pngUrl = canvas.toDataURL("image/png"); // Convert to PNG
  //     const link = document.createElement("a");
  //     link.href = pngUrl;
  //     link.download = `synko-table-${data?.number}_${pixelSize}x${pixelSize}.png`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   }
  // };

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
        <CustomKeyboard
          onChange={(e) => {
            handleKeyboardInput(e);
          }}
          isShow={keyboardShow}
          setIsShow={setKeyboardShow}
          keyRef={keyboardRef}
          useNumericLayout={isNumericType}
        />
        {alert.message && <CAlert color={alert.type}>{alert.message}</CAlert>}
        <form onSubmit={handleSubmit}>
          <div className="w-[100%] text-[14px] text-black">
            <div className="flex flex-col space-y-1">
              <span>Table No*</span>
              <input
                type="number"
                name="number"
                step={1}
                min={0}
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                required
                value={inputs?.number ?? ""}
                onChange={handleInputs}
                placeholder="Enter Table #"
                onFocus={() => {
                  setIsNumericType(true);
                  handleInputFocus("number");
                }}
                readOnly={os == "android" && isVisible == true ? true : false}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <span>Table Name</span>
              <input
                type="text"
                name="name"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                value={inputs?.name ?? ""}
                onChange={handleInputs}
                placeholder="Enter Table Name"
                onFocus={() => {
                  handleInputFocus("name");
                }}
                readOnly={os == "android" && isVisible == true ? true : false}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <span>Seating Capacity*</span>
              <input
                type="number"
                name="seating_capacity"
                step={1}
                min={0}
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                required
                value={inputs?.seating_capacity ?? ""}
                onChange={handleInputs}
                placeholder="Enter Seating Capacity"
                onFocus={() => {
                  setIsNumericType(true);
                  handleInputFocus("seating_capacity");
                }}
                readOnly={os == "android" && isVisible == true ? true : false}
              />
            </div>

            <div className="flex flex-col py-3 space-y-1">
              <span>Select Visibility Status*</span>
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
        {data?.qrcode?.link && (
          <>
            <div className="flex flex-col items-center justify-center py-[40px] bg-gray-100">
              <h1 className="text-[23px] text-center font-bold text-gray-800 mb-4">
                QR Code
              </h1>
              <div ref={qrRef} className="mb-6 hidden">
                <div
                  style={{ width: pixelSize + 150 }}
                  className={`relative bg-white p-6 rounded-2xl shadow-lg text-center overflow-hidden`}
                >
                  <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#116739] rounded-full"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#75d843] rounded-tl-full"></div>

                  <h1 className=" font  text-2xl font-bold text-gray-800 mb-[5px]">
                    Table{" "}
                    <span className=" number  text-[#116739]">
                      {inputs?.number}
                    </span>
                  </h1>
                  <div className="my-1 inline-block">
                    <QRCodeCanvas
                      value={data?.qrcode?.link || ""}
                      size={pixelSize}
                    />
                  </div>
                  <p className="text-gray-600 text-lg font-semibold ">
                    Scan . Order . Pay
                  </p>
                  <p className="text-gray-400 text-md">
                    Powered by{" "}
                    <span className="text-[#75d843] font-[700]">Synko</span>
                  </p>
                </div>
              </div>
              <div className="mb-6">
                <QRCodeCanvas value={data?.qrcode?.link || ""} size={256} />
              </div>
              <div className="flex mb-4 gap-x-[2px] justify-center items-center">
                <input
                  type="number"
                  value={pixelSize}
                  onChange={(e) => setPixelSize(Number(e.target.value))}
                  min="100"
                  max="1000"
                  className="px-4 py-2 border border-gray-300 rounded-md text-center text-gray-800"
                  placeholder="Enter size in pixels"
                />
                px
              </div>
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-[#055938] text-white font-semibold rounded-lg shadow-lg hover:bg-[#055938] transition-all duration-300"
              >
                Download QR Code as PNG
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default function Tables() {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);

  const router = useRouter();

  const getData = () => {
    getRequest(`/merchant/${merchant?.id}/table`).then((res) => {
      setPageLevelLoader(false);
      setData(res?.data);
      setIsDataUpdated(false);
    });
  };

  const handleDelete = (id) => {
    setLoading(true);
    setSelectedId(id);
    postRequest(`/merchant/${merchant?.id}/table/${id}`, {}, "delete")
      .then((res) => {
        getData();
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
    if (merchant?.id !== undefined && user) getData();
  }, [user, merchant]);

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
    <ProtectedRoute pageName={"tables"}>
      <div className="min-h-screen flex bg-[#171821]">
        <SideMenu />

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

        <div className="w-[100%] xl:ml-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6 h-screen overflow-auto text-black bg-[#171821]">
          <div className="w-[100%] h-[calc(100vh-48px)] overflow-y-auto bg-[#F8F8F8] rounded-[20px]  py-10 lg:p-10 px-3 md:px-8  lg:pr-16">
            <div className="w-[100%] border-b-2 text-[24px] py">
              Manage Tables
            </div>
            <div className="w-[100%] flex justify-end py-5 items-center">
              {/* <input
              required
              className="border p-4 w-[45%] rounded-[15px] bg-[#F8F8F8] outline-none"
              placeholder="Search..."
            /> */}
              {/* <button
                onClick={() => router.push("/manage/visual-tables")}
                id="shadow"
                className="bg-white px-4 mr-2 py-2 text-[14px] rounded-[10px] flex space-x-3"
              >
                <img src="/images/Vector.png" />
                <p>Visual Table</p>
              </button> */}

              <button
                onClick={() => {
                  handleModal({
                    heading: "Add a table",
                    operation: "add",
                    getDataUrl: "",
                    postDataUrl: "table",
                  });
                }}
                id="shadow"
                className="bg-white px-4 py-2 text-[14px] rounded-[10px] flex space-x-3"
              >
                <img src="/images/Vector1.png" />
                <p>Add Table</p>
              </button>
            </div>
            <div className=" no-scrollbar relative overflow-x-auto min-h-screen h-full  overflow-y-auto">
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-[#055938] text-[#ffffff]">
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Table #
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">Name</th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Seating Capacity
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Status
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data && data.length > 0 ? (
                    <>
                      {data?.map((item) => (
                        <tr
                          key={item?.id}
                          className="border-b bg-white text-[14px]"
                        >
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.number}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.name || "-"}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.seating_capacity}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.status == 1 ? (
                              <div className="bg-green-100 text-green-500 px-2 py-1 w-fit text-center rounded-[5px]">
                                Active
                              </div>
                            ) : (
                              <div className="bg-red-100 text-red-500 px-2 py-1 w-fit text-center rounded-[5px]">
                                Disabled
                              </div>
                            )}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            <Actions
                              item={item}
                              navActions={[
                                {
                                  title: "Edit",
                                  func: () =>
                                    handleModal({
                                      heading: "Update Table",
                                      operation: "update",
                                      getDataUrl: `table/${item?.id}`,
                                      postDataUrl: `table/${item?.id}`,
                                    }),
                                },
                                {
                                  title: "Delete",
                                  func: () => handleDelete(item?.id),
                                },
                              ]}
                            />
                          </td>
                          {/* <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            <div className="p-4">
                              <div className="group relative">
                                <button>
                                  <BsThreeDots size={22} />
                                </button>
                                <nav
                                  tabIndex="0"
                                  className="border-2 bg-white invisible border-gray-800 rounded absolute right-5 -top-10 transition-all opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-1 z-10"
                                >
                                  <ul className="py-1">
                                    <li>
                                      <button
                                        onClick={() => {
                                          handleModal({
                                            heading: "Update Modifier",
                                            operation: "update",
                                            getDataUrl: `table/${item?.id}`,
                                            postDataUrl: `table/${item?.id}`,
                                          });
                                        }}
                                        className="block px-4 py-2 hover:bg-gray-100 w-[100%]"
                                      >
                                        Edit
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        onClick={() => handleDelete(item?.id)}
                                        className="block px-4 py-2 hover:bg-gray-100 w-[100%]"
                                      >
                                        {selectedId == item?.id &&
                                        loading == true ? (
                                          <>
                                            <CSpinner />
                                          </>
                                        ) : (
                                          <>Delete</>
                                        )}
                                      </button>
                                    </li>
                                  </ul>
                                </nav>
                              </div>
                            </div>
                          </td> */}
                        </tr>
                      ))}
                    </>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
