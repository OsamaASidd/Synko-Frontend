import CSpinner from "@/components/common/CSpinner";
import Modal from "@/components/modal";
import { GlobalContext } from "@/context";
import { getRequest, postRequest, request } from "@/utils/apiFunctions";
import { getErrorMessageFromResponse } from "@/utils/helper";
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { app_integrations } from "@/utils/constants";
import { useRouter } from "next/navigation";
import axios from "axios";
const ManageApp = ({
  modelIsOpen,
  setIsModalOpen,
  heading = "Modal",
  operation = "add",
  postDataUrl = "",
  data,
  setIsDataUpdated,
}) => {
  const router = useRouter();
  const { merchant } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [toggleTerminal, setToggleTerminal] = useState(false);
  const [newTerminal, setNewTerminal] = useState({
    ip: "",
    terminal_id: "",
    device_management_id: "",
    pair_code: "",
  });

  const initialState = {
    integrated_app_id: "",
    configurations: "",
  };
  const [inputs, setInputs] = useState(initialState);

  const [devices, setDevices] = useState([]);
  const getDevices = () => {
    getRequest(`/merchant/${merchant?.id}/get-all-devices`)
      .then((res) => {
        setDevices(res?.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    getDevices();
  }, [merchant]);

  const getInputs = (data) => {
    if (data?.name === app_integrations.paymentree.id) {
      return {
        ...app_integrations.paymentree.inputs,
        ...data?.merchant_app?.configurations,
        terminals: data?.merchant_app?.configurations?.terminals || [],
      };
    }

    if (data?.name === app_integrations.viva.id) {
      return {
        ...app_integrations.viva.inputs,
        ...data?.merchant_app?.configurations,
        terminals: data?.merchant_app?.configurations?.terminals || [],
      };
    }

    if (data?.name === app_integrations.viva_direct.id) {
      return {
        ...app_integrations.viva_direct.inputs,
        ...data?.merchant_app?.configurations,
        terminals: data?.merchant_app?.configurations?.terminals || [],
      };
    }

    if (data?.name === app_integrations.apax_terminals.id) {
      return {
        ...app_integrations.apax_terminals.inputs,
        ...data?.merchant_app?.configurations,
        terminals: data?.merchant_app?.configurations?.terminals || [],
      };
    }
  };

  const [formState, setFormState] = useState(getInputs(data));
  useEffect(() => {
    setFormState(getInputs(data));
  }, [data]);

  const handleSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();
    let url = "";
    if (postDataUrl !== "") {
      url = postDataUrl;
    }

    let authToken = null;
    let updateInputs = null;
    try {
      updateInputs = formState;
      // if (data?.name === app_integrations.apax_terminals.id) {
      //   updateInputs = {
      //     ...formState,
      //     terminals: [
      //       {
      //         terminal_id: formState?.terminals[0]?.terminal_id,
      //         device_management_id:
      //           formState?.terminals[0]?.device_management_id,
      //         ip: formState?.terminals[0]?.ip,
      //         auth_token: null,
      //       },
      //     ],
      //   };
      // } else {
      //   updateInputs = formState;
      // }

      const updatedInputs = {
        ...inputs,
        configurations: JSON.stringify(updateInputs),
      };

      postRequest(`/merchant/${merchant?.id}/${url}`, updatedInputs, "post")
        .then((res) => {
          Swal.fire({
            text: res.data.message,
            icon: "success",
          });
          if (res?.data?.onBoardURL) {
            window.open(res?.data?.onBoardURL, "_blank");
          }
          event.target.reset();
          setIsDataUpdated(true);
          setIsModalOpen(false);
        })
        .catch((err) => getErrorMessageFromResponse(err))
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.log("ERROR ON REQUEST");
      console.log(error);
      console.log(error?.response);
      console.log(error?.response?.data);
      Swal.fire({ icon: "error", text: "Request Failed!" });
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    setInputs({ ...inputs, integrated_app_id: data?.id });
  }, [operation]);

  const handleInputs = (event) => {
    setInputs((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleDeleteTerminal = (indexToDelete) => {
    setFormState((prevState) => ({
      ...prevState,
      terminals: prevState.terminals.filter(
        (_, index) => index !== indexToDelete
      ),
    }));
  };

  // const [formState, setFormState] = useState(
  //   data?.name === app_integrations.paymentree.id ||
  //     data?.name === app_integrations.viva.id
  //     ? {
  //         ...app_integrations.paymentree.inputs,
  //         ...data?.merchant_app?.configurations,
  //       }
  //     : { ...app_integrations.paymentree.inputs }
  // );
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleNewTerminalChange = (e) => {
    const { name, value } = e.target;
    setNewTerminal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addTerminalToFormState = () => {
    setFormState((prevState) => ({
      ...prevState,
      terminals: [...prevState?.terminals, newTerminal],
    }));

    // Reset newTerminal after adding
    setNewTerminal({
      ip: "",
      terminal_id: "",
      device_management_id: "",
    });
  };

  const renderTerminalsTable = () => (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-left border-collapse mt-2">
        <thead>
          <tr>
            <th className="border p-2">No.</th>
            <th className="border p-2">Terminal ID</th>
            <th className="border p-2">Terminal IP</th>
            <th className="border p-2">Device Management ID</th>
            <th className="border p-2">Delete</th>
          </tr>
        </thead>
        <tbody>
          {formState?.terminals.map((terminal, index) => (
            <tr key={index}>
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{terminal.terminal_id}</td>
              <td className="border p-2">{terminal.ip}</td>
              <td className="border p-2">
                {
                  devices?.find(
                    (device) => device?.id == terminal.device_management_id
                  )?.name
                }
              </td>
              <td className="border p-2">
                <button
                  type="button"
                  onClick={() => handleDeleteTerminal(index)}
                >
                  <svg
                    className="w-5 h-5 ml-2 hover"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3 6h18M7 6v12a2 2 0 002 2h6a2 2 0 002-2V6M10 6V4a2 2 0 014 0v2M4 6h16"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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
            {data?.name === app_integrations.paymentree.id && (
              <>
                {!toggleTerminal &&
                  Object.keys(app_integrations.paymentree.inputs).map((key) => (
                    <div
                      key={key}
                      className="flex flex-col space-y-1 mb-[20px]"
                    >
                      <label className="capitalize" htmlFor={key}>
                        {key.replace(/_/g, " ")}
                      </label>
                      <input
                        type="text"
                        className="w-[100%] border-2 p-2 rounded-md outline-none"
                        id={key}
                        name={key}
                        value={formState[key]}
                        required
                        onChange={handleChange}
                      />
                    </div>
                  ))}
                {!toggleTerminal && (
                  <div className="flex flex-row space-y-1 mb-[20px]">
                    <button
                      type="button"
                      class="text-white  flex-end bg-gradient-to-r from-[#7DE143] to-[#055938]  font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      onClick={() => {
                        setToggleTerminal((terminals) => !terminals);
                        // addTerminal();
                      }}
                    >
                      Add Terminals
                      <svg
                        class="w- h-5 ml-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span class="sr-only">Icon description</span>
                    </button>
                  </div>
                )}
                {toggleTerminal && (
                  <>
                    <div className="flex flex-col space-y-2">
                      <input
                        type="text"
                        placeholder="Terminal ID"
                        name="terminal_id"
                        value={newTerminal.terminal_id}
                        onChange={handleNewTerminalChange}
                        className="w-full border p-2 rounded-md"
                      />
                      <select
                        onChange={handleNewTerminalChange}
                        name="device_management_id"
                        className="w-full border p-2 rounded-md"
                      >
                        <option value={""}>Select Device Id</option>
                        {devices && devices?.length > 0 ? (
                          <>
                            {devices.map((item, index) => (
                              <option key={index} value={item?.id}>
                                {item?.name}
                              </option>
                            ))}
                          </>
                        ) : null}
                      </select>
                      {/* <input
                        type="text"
                        placeholder="Device Management ID"
                        name="device_management_id"
                        value={newTerminal.device_management_id}
                        onChange={handleNewTerminalChange}
                        className="w-full border p-2 rounded-md"
                      /> */}
                      <button
                        type="button"
                        className="bg-[#fff] border border-[#055938] text-[#055938] p-2 rounded-md"
                        onClick={addTerminalToFormState}
                      >
                        Add Terminal
                      </button>
                    </div>

                    {/* Render the terminals table */}
                    {formState?.terminals?.length ? (
                      renderTerminalsTable()
                    ) : (
                      <> </>
                    )}
                  </>
                )}
              </>
            )}
            {data?.name === app_integrations.viva.id && (
              <>
                {Object.keys(app_integrations.viva.inputs).map((key) => {
                  if (["account_id"].includes(key)) return <></>;

                  if (["email"].includes(key) && operation === "add") {
                    return (
                      <div
                        key={key}
                        className="flex flex-col space-y-1 mb-[20px]"
                      >
                        <label className="capitalize" htmlFor={key}>
                          {key.replace(/_/g, " ")}
                          {key === "primaryColor" ? "" : "*"}
                        </label>
                        <input
                          type="text"
                          className="w-[100%] border-2 p-2 rounded-md outline-none"
                          id={key}
                          name={key}
                          value={formState[key]}
                          required={key === "primaryColor" ? false : true}
                          onChange={handleChange}
                        />
                      </div>
                    );
                  }

                  return null; // Return null for other cases to avoid rendering unnecessary elements
                })}

                {operation === "update" && (
                  <>
                    <div className="flex flex-col space-y-2">
                      <input
                        type="text"
                        placeholder="Terminal ID"
                        name="terminal_id"
                        value={newTerminal.terminal_id}
                        onChange={handleNewTerminalChange}
                        className="w-full border p-2 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Device Management ID"
                        name="device_management_id"
                        value={newTerminal.device_management_id}
                        onChange={handleNewTerminalChange}
                        className="w-full border p-2 rounded-md"
                      />
                      <button
                        type="button"
                        className="bg-[#fff] border border-[#055938] text-[#055938] p-2 rounded-md"
                        onClick={addTerminalToFormState}
                      >
                        Add Terminal
                      </button>
                    </div>

                    {formState?.terminals?.length
                      ? renderTerminalsTable()
                      : null}
                  </>
                )}
              </>
            )}

            {data?.name === app_integrations.viva_direct.id && (
              <>
                {!toggleTerminal &&
                  Object.keys(app_integrations.viva_direct.inputs).map(
                    (key) => {
                      return (
                        <div
                          key={key}
                          className="flex flex-col space-y-1 mb-[20px]"
                        >
                          <label className="capitalize" htmlFor={key}>
                            {key.replace(/_/g, " ")}
                          </label>
                          <input
                            type="text"
                            className="w-[100%] border-2 p-2 rounded-md outline-none"
                            id={key}
                            name={key}
                            value={formState[key]}
                            onChange={handleChange}
                          />
                        </div>
                      );
                    }
                  )}
                {!toggleTerminal && (
                  <div className="flex flex-row space-y-1 mb-[20px]">
                    <button
                      type="button"
                      class="text-white  flex-end bg-gradient-to-r from-[#7DE143] to-[#055938]  font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      onClick={() => {
                        setToggleTerminal((terminals) => !terminals);
                        // addTerminal();
                      }}
                    >
                      Add Terminals
                      <svg
                        class="w- h-5 ml-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span class="sr-only">Icon description</span>
                    </button>
                  </div>
                )}
                {toggleTerminal && (
                  <>
                    <div className="flex flex-col space-y-2">
                      <input
                        type="text"
                        placeholder="Terminal ID"
                        name="terminal_id"
                        value={newTerminal.terminal_id}
                        onChange={handleNewTerminalChange}
                        className="w-full border p-2 rounded-md"
                      />
                      <select
                        onChange={handleNewTerminalChange}
                        name="device_management_id"
                        className="w-full border p-2 rounded-md"
                      >
                        <option value="">Select Device Id</option>
                        {devices && devices?.length > 0 ? (
                          <>
                            {devices.map((item, index) => (
                              <option key={index} value={item?.id}>
                                {item?.name}
                              </option>
                            ))}
                          </>
                        ) : null}
                      </select>
                      <button
                        type="button"
                        className="bg-[#fff] border border-[#055938] text-[#055938] p-2 rounded-md"
                        onClick={addTerminalToFormState}
                      >
                        Add Terminal
                      </button>
                    </div>

                    {/* Render the terminals table */}
                    {formState?.terminals?.length ? (
                      renderTerminalsTable()
                    ) : (
                      <> </>
                    )}
                  </>
                )}
              </>
            )}

            {data?.name === app_integrations.apax_terminals.id && (
              <>
                {!toggleTerminal &&
                  Object.keys(app_integrations.apax_terminals.inputs).map(
                    (key) => {
                      if (["pair_code"].includes(key)) return <></>;
                      return (
                        <div
                          key={key}
                          className="flex flex-col space-y-1 mb-[20px]"
                        >
                          <label className="capitalize" htmlFor={key}>
                            {key.replace(/_/g, " ")}
                          </label>
                          <input
                            type="text"
                            className="w-[100%] border-2 p-2 rounded-md outline-none"
                            id={key}
                            name={key}
                            value={formState[key]}
                            onChange={handleChange}
                          />
                        </div>
                      );
                    }
                  )}
                {!toggleTerminal && (
                  <div className="flex flex-row space-y-1 mb-[20px]">
                    <button
                      type="button"
                      class="text-white  flex-end bg-gradient-to-r from-[#7DE143] to-[#055938]  font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      onClick={() => {
                        setToggleTerminal((terminals) => !terminals);
                        // addTerminal();
                      }}
                    >
                      Add Terminals
                      <svg
                        class="w- h-5 ml-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span class="sr-only">Icon description</span>
                    </button>
                  </div>
                )}
                {toggleTerminal && (
                  <>
                    <div className="flex flex-col space-y-2">
                      <input
                        type="text"
                        placeholder="Terminal IP"
                        name="ip"
                        value={newTerminal.ip}
                        onChange={handleNewTerminalChange}
                        className="w-full border p-2 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Terminal ID"
                        name="terminal_id"
                        value={newTerminal.terminal_id}
                        onChange={handleNewTerminalChange}
                        className="w-full border p-2 rounded-md"
                      />
                      <select
                        onChange={handleNewTerminalChange}
                        name="device_management_id"
                        className="w-full border p-2 rounded-md"
                      >
                        <option value={""}>Select Device Id</option>
                        {devices && devices?.length > 0 ? (
                          <>
                            {devices.map((item, index) => (
                              <option key={index} value={item?.id}>
                                {item?.name}
                              </option>
                            ))}
                          </>
                        ) : null}
                      </select>
                      <button
                        type="button"
                        className="bg-[#fff] border border-[#055938] text-[#055938] p-2 rounded-md"
                        onClick={addTerminalToFormState}
                      >
                        Add Terminal
                      </button>
                    </div>

                    {/* Render the terminals table */}
                    {formState?.terminals?.length ? (
                      renderTerminalsTable()
                    ) : (
                      <> </>
                    )}
                  </>
                )}
              </>
            )}
            <div className="flex justify-center space-x-4 w-[100%] mt-[20px]">
              <button
                type="submit"
                className="w-[70px] px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white text-center"
                disabled={loading}
              >
                {loading ? <CSpinner /> : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="border border-black min-w-[70px] px-3 py-2 rounded-[8px] text-center"
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

export default ManageApp;
