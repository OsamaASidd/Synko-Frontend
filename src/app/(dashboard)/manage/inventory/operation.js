import CSpinner from "@/components/common/CSpinner";
import Modal from "@/components/modal";
import { GlobalContext } from "@/context";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { getErrorMessageFromResponse } from "@/utils/helper";
import { useContext, useEffect, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";

const ManageOperationModal = ({
  modelIsOpen,
  setIsModalOpen,
  heading = "Modal",
  operation = "add",
  getDataUrl = "",
  postDataUrl = "",
  setIsDataUpdated,
}) => {
  const { merchant, user } = useContext(GlobalContext);

  const [loading, setLoading] = useState(false);

  const initialState = {
    unit_id: "",
    name: "",
    sku: "",
    status: "",
  };
  const [inputs, setInputs] = useState(initialState);

  const [units, setUnit] = useState([]);
  const getUnitData = () => {
    getRequest(`/get-unit`, {}, true).then((res) => {
      setUnit(
        res?.data.map((cat) => ({
          label: "Per " + cat.name,
          value: cat.id,
        }))
      );
    });
  };

  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/${getDataUrl}`).then((res) => {
      setLoading(false);
      setInputs({
        unit_id: res?.data?.unit_id,
        name: res?.data?.name,
        status: res?.data?.status,
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
    if (user !== null && merchant !== null) {
      getUnitData();
    }
  }, [user, merchant]);

  useEffect(() => {
    if (operation == "update" && getDataUrl !== "") {
      getData();
    } else {
      setInputs(initialState);
    }
  }, [operation, getDataUrl]);

  const handleInputs = (event) => {
    setInputs((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

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
            <div className="flex flex-col space-y-1">
              <span>Notification (min limit of item)</span>
              <input
                type="number"
                name="not_limit"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                required
                value={inputs?.not_limit}
                onChange={handleInputs}
                placeholder="Enter Item Minimum limit"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <span>Item Name*</span>
              <input
                type="text"
                name="name"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                required
                value={inputs?.name}
                onChange={handleInputs}
                placeholder="Enter Item Name"
              />
            </div>

            <div className="flex flex-col py-3 space-y-1">
              <span>Select Unit*</span>
              <Select
                name="unit_id"
                options={units}
                onChange={(option) => {
                  setInputs({ ...inputs, unit_id: option?.value });
                }}
                defaultValue={units.find(
                  (option) => option.value === inputs?.unit_id
                )}
                placeholder="Select Unit"
                className="react-select-container" // You can customize the class for styling
                classNamePrefix="react-select" // Prefix for inner classes
                value={units.find((option) => option.value === inputs?.unit_id)}
              />
            </div>

            {/* <div className="flex flex-col space-y-1 mb-[20px]">
              <span>SKU*</span>
              <input
                type="number"
                name="sku"
                step={1}
                min={0}
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                required
                value={inputs?.sku ?? ""}
                onChange={handleInputs}
                placeholder="Enter Seating Capacity"
              />
            </div> */}

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

export default ManageOperationModal;
