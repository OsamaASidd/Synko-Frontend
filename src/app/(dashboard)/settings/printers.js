import CSpinner from "@/components/common/CSpinner";
import InputField from "@/components/common/input-field";
import Button from "@/components/ui/button";
import InputsInfoBox from "@/components/ui/inputs-info-box";
import { Switch } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Placeholder } from "rsuite";
import { GlobalContext } from "@/context";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { debounce, getErrorMessageFromResponse } from "@/utils/helper";
import useHandleInputs from "@/hooks/useHandleInputs";

import { Table } from "rsuite";
import "rsuite/Table/styles/index.css";
import AddPrinter from "./add-printer";
const { Column, HeaderCell, Cell } = Table;

export default function Printers() {
  const { user, merchant } = useContext(GlobalContext);

  const [loading, setLoading] = useState(false);
  const [inputs, handleInputs, setInputs] = useHandleInputs([]);
  const [isPrinter, setIsPrinter] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [devices, setDevice] = useState([]);

  const getDevices = () => {
    getRequest(`/merchant/${merchant?.id}/device`)
      .then((res) => {
        setDevice(res?.data);
      })
      .catch((err) => getErrorMessageFromResponse(err));
  };

  const [data, setData] = useState([]);
  const getData = () => {
    getRequest(`/merchant/${merchant?.id}/printer-devices`)
      .then((res) => {
        setData(res?.data);
      })
      .catch((err) => getErrorMessageFromResponse(err));
  };

  const [isPrinterLoading, setIsPrinterLoading] = useState(false);
  const getPrinterStatus = () => {
    setIsPrinterLoading(true);
    getRequest(`/merchant/${merchant?.id}/status/printer`)
      .then((res) => {
        setIsPrinter(res?.data?.status);
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setIsPrinterLoading(false);
      });
  };
  const handleSwitch = () => {
    setIsPrinterLoading(true);
    postRequest(`/merchant/${merchant?.id}/status/printer`, {})
      .then((res) => {
        setIsPrinter(res?.data?.status);
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setIsPrinterLoading(false);
      });
  };

  const printerInit = {
    id: null,
    merchant_id: merchant?.id,
    device_management_id: null,
    ip_address: null,
    ip_port: null,
    isNew: true,
    printer_status: 0,
  };

  const addPrinter = () => {
    setInputs([printerInit]);
  };

  useEffect(() => {
    if (merchant.id !== undefined) {
      getDevices();
      getPrinterStatus();
      if (isPrinter == true) {
        getData();
      }
    }
  }, [merchant]);

  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);
  const dopenModal = debounce(setIsModalOpen, 800);
  const handleModal = (data) => {
    setCurrentModalData(data);
    dopenModal(true);
  };
  const [dataUpdated, setIsDataUpdated] = useState(null);
  useEffect(() => {
    if (dataUpdated == true) {
      getData();
    }
  }, [dataUpdated]);

  const DeviceManagmentName = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
      {rowData[dataKey] ? `${rowData[dataKey]?.name}` : "--"}
    </Cell>
  );

  return (
    <>
      <InputsInfoBox
        className={"!px-5 !text-[18px] !pb-[20px]"}
        title={"Printer Settings"}
      >
        <div className="space-y-4 mt-[40px]">
          <div className="flex mt-[40px] justify-between items-center">
            <div className="mr-5 flex flex-col justify-center">
              <span>Enable Epson Printer</span>
              <span className="text-[12px]">
                Ensure that both the printer and the POS system are connected to
                the same network!
              </span>
            </div>
            <div>
              <Switch checked={isPrinter} onChange={handleSwitch} />
              {isPrinterLoading == true ? (
                <CSpinner color="text-black" />
              ) : null}
            </div>
          </div>
          {isPrinter == true && (
            <>
              {modelIsOpen == true && (
                <AddPrinter
                  modelIsOpen={modelIsOpen}
                  setIsModalOpen={setIsModalOpen}
                  heading={currentModalData?.heading}
                  operation={currentModalData?.operation}
                  getDataUrl={currentModalData?.getDataUrl}
                  postDataUrl={currentModalData?.postDataUrl}
                  setIsDataUpdated={setIsDataUpdated}
                ></AddPrinter>
              )}
              <div className="w-full flex justify-end items-center mt-[20px]">
                <Button
                  onClick={() => {
                    handleModal({
                      heading: "Add a Epson Printer",
                      operation: "add",
                      getDataUrl: "",
                      postDataUrl: "table",
                    });
                  }}
                  disabled={loading}
                  className={"text-[13px]"}
                >
                  Add Printer Settings
                </Button>
              </div>
              <Table height={200} data={data} onRowClick={(rowData) => {}}>
                <Column width={100}>
                  <HeaderCell>ID #</HeaderCell>
                  <Cell dataKey="id" />
                </Column>
                <Column width={180}>
                  <HeaderCell>IP Address</HeaderCell>
                  <Cell dataKey="ip_address" />
                </Column>
                <Column width={100}>
                  <HeaderCell>IP Port</HeaderCell>
                  <Cell dataKey="ip_port" />
                </Column>
                <Column width={180}>
                  <HeaderCell>Linked Device Name</HeaderCell>
                  <DeviceManagmentName dataKey="device_management" />
                </Column>
                <Column width={180}>
                  <HeaderCell>Printer Status</HeaderCell>
                  <Cell dataKey="printer_status" />
                </Column>
                <Column width={180}>
                  <HeaderCell>...</HeaderCell>

                  <Cell style={{ padding: "6px" }}>
                    {(rowData) => (
                      <button
                        appearance="link"
                        onClick={() => {
                          // getSingleOrderData(rowData?.id);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </Cell>
                </Column>
              </Table>
              {/* 
              <PanelGroup accordion bordered>
                {inputs?.length > 0 ? (
                  <>
                    {inputs.map((item, index) => {
                      return (
                        <Panel
                          key={index}
                          header={`Printer ${index + 1}`}
                          eventKey={index}
                        >
                          <div>
                            <div>
                              <InputField
                                name={`data[${index}][device_management_id]`}
                                type="text"
                                placeholder={"Printer IP Address"}
                                label={"Printer IP Address"}
                                required={true}
                                isSelectInput={true}
                                selectOptions={
                                  <>
                                    {devices?.length > 0 &&
                                      devices?.map((ditem, dindex) => (
                                        <option key={dindex} value={ditem?.id}>
                                          {ditem?.name}
                                        </option>
                                      ))}
                                  </>
                                }
                                onChange={handleInputs}
                              />
                            </div>
                            <div>
                              <InputField
                                name={`data[${index}][printer_ip_address]`}
                                type="text"
                                placeholder={"Printer IP Address"}
                                label={"Printer IP Address"}
                                required={true}
                                //   onChange={handleInputs}
                                //   onFocus={() => handleError(null, "old_password")}
                                //   error={errors?.old_password}
                              />
                            </div>
                            <div>
                              <InputField
                                name={`data[${index}][printer_ip_port]`}
                                type="text"
                                placeholder={"Printer IP Port"}
                                label={"Printer IP Port"}
                                required={true}
                                //   onChange={handleInputs}
                                //   onFocus={() => handleError(null, "old_password")}
                                //   error={errors?.old_password}
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Status: </span>
                              <span
                                className={`${
                                  item.printer_status == true
                                    ? "text-lime-600"
                                    : "text-red-500"
                                }`}
                              >
                                {loading == true ? (
                                  "Connecting..."
                                ) : (
                                  <>
                                    {item.printer_status == true
                                      ? "Connected"
                                      : "Disconnected"}
                                  </>
                                )}
                              </span>
                            </div>
                            <div className="w-full flex justify-end items-center mt-[20px]">
                              <Button
                                onClick={() => {
                                  // validate();
                                }}
                                disabled={loading}
                                className={"text-[13px]"}
                              >
                                {loading == true ? (
                                  <CSpinner />
                                ) : (
                                  "Save & Connect"
                                )}
                              </Button>
                            </div>
                          </div>
                        </Panel>
                      );
                    })}
                  </>
                ) : null}
              </PanelGroup> */}
              {/* <div>
                <div>
                  <InputField
                    name="printer_ip_address"
                    type="text"
                    placeholder={"Printer IP Address"}
                    label={"Printer IP Address"}
                    required={true}
                    //   onChange={handleInputs}
                    //   onFocus={() => handleError(null, "old_password")}
                    //   error={errors?.old_password}
                  />
                </div>
                <div>
                  <InputField
                    name="printer_ip_port"
                    type="text"
                    placeholder={"Printer IP Port"}
                    label={"Printer IP Port"}
                    required={true}
                    //   onChange={handleInputs}
                    //   onFocus={() => handleError(null, "old_password")}
                    //   error={errors?.old_password}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>Status: </span>
                  <span
                    className={`${
                      isConnected == true ? "text-lime-600" : "text-red-500"
                    }`}
                  >
                    {loading == true ? (
                      "Connecting..."
                    ) : (
                      <>{isConnected == true ? "Connected" : "Disconnected"}</>
                    )}
                  </span>
                </div>
                <div className="w-full flex justify-end items-center mt-[20px]">
                  <Button
                    onClick={() => {
                      // validate();
                    }}
                    disabled={loading}
                    className={"text-[13px]"}
                  >
                    {loading == true ? <CSpinner /> : "Save & Connect"}
                  </Button>
                </div>
              </div> */}
            </>
          )}
        </div>
      </InputsInfoBox>
    </>
  );
}
