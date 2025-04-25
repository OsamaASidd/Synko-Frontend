import InputField from "@/components/common/input-field";
import Modal from "@/components/modal";
import { GlobalContext } from "@/context";
import useHandleInputs from "@/hooks/useHandleInputs";
import { postRequest } from "@/utils/apiFunctions";
import { getErrorMessageFromResponse } from "@/utils/helper";
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function AddPrinter({
  modelIsOpen,
  setIsModalOpen,
  heading = "Modal",
  operation = "add",
  getDataUrl = "",
  postDataUrl = "",
  setIsDataUpdated,
}) {
  const { merchant } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const initialState = {
    device_management_id: null,
    ip_address: null,
    ip_port: null,
    printer_status: 0,
  };
  const [inputs, handleInputs, setInputs] = useHandleInputs({
    device_management_id: null,
    printer: null,
    ip_address: null,
    ip_port: null,
    printer_status: 0,
  });

  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/${getDataUrl}`).then((res) => {
      setLoading(false);
      setInputs({
        device_management_id: res?.data?.device_management_id,
        printer: res?.data?.printer,
        ip_address: res?.data?.ip_address,
        ip_port: res?.data?.ip_port,
        printer_status: res?.data?.printer_status,
      });
    });
  };

  const handleSubmit = (event) => {
    setLoading(true);
    event?.preventDefault();
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

  return (
    <>
      <Modal
        isOpen={modelIsOpen}
        heading={heading}
        onClose={() => {
          setInputs(initialState);
          setIsModalOpen(false);
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="w-[100%] text-[14px] text-black">
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
          </div>
        </form>
      </Modal>
    </>
  );
}
