import CSpinner from "@/components/common/CSpinner";
import Modal from "@/components/modal";
import { GlobalContext } from "@/context";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { getErrorMessageFromResponse } from "@/utils/helper";
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import CreatableSelect from "react-select/creatable";

const ManageStock = ({
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
    stock_action: "",
    stock: "",
    price: "",
    vendor_id: "",
    not_limit: 0
  };
  const [inputs, setInputs] = useState(initialState);

  const [vendors, setVendor] = useState([]);
  const getUnitData = () => {
    getRequest(`/merchant/${merchant?.id}/vendor`).then((res) => {
      setVendor(
        res?.data.map((cat) => ({
          label: cat.name,
          value: cat.id,
        }))
      );
    });
  };

  const [data, setData] = useState(null);
  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/${getDataUrl}`).then((res) => {
      setLoading(false);
      setData(res?.data);

      let no_limit = res?.data?.inventoryLimit.length ? res?.data?.inventoryLimit[0]?.limit : 0;
      let data ={
        stock_action: "",
        stock: "",
        price: "",
        vendor_id: "",
        not_limit: no_limit
      }
      setInputs(data);
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

  const handleCreateVendor = (value) => {
    setLoading(true);
    postRequest(`/merchant/${merchant?.id}/vendor`, {
      name: value,
    })
      .then((res) => {
        const { name, id } = res?.data?.data;
        setVendor((prev) => [...prev, { label: name, value: id }]);
        setInputs({ ...inputs, vendor_id: res?.data?.data?.id });
      })
      .finally(() => {
        setLoading(false);
      });
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
            <div className="flex justify-between mb-[20px]">
              <div className="flex flex-col space-y-1">
                <span>Item Name</span>
                <h5>{data?.name}</h5>
              </div>
              <div className="flex flex-col space-y-1">
                <span>Available Stock</span>
                <h5>{data?.available_quantity ?? 0}</h5>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span>Notification (min stock)</span>
              <input
                type="number"
                name="not_limit"
                min={0}
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                value={inputs?.not_limit}
                onChange={handleInputs}
                placeholder="add limit of notifation stock"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex flex-col py-3 space-y-1">
                <span>Stock Action*</span>
                <select
                  name="stock_action"
                  onChange={handleInputs}
                  placeholder="Select Stock Action"
                  className="h-[40px] border-2 rounded-md px-[8px]"
                  required
                  value={inputs?.stock_action}
                >
                  <option value={""}>Select Stock Action</option>
                  <option value={"received"}>Received</option>
                  <option value={"sold"}>Sold</option>
                  <option value={"damage"}>Damage</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <span>Stock*</span>
                <input
                  type="number"
                  name="stock"
                  step={1}
                  min={0}
                  className="w-[100%] border-2 p-2 rounded-md outline-none"
                  required
                  value={inputs?.stock ?? ""}
                  onChange={handleInputs}
                  placeholder="Enter Stock"
                />
              </div>
            </div>

            {inputs?.stock_action == "received" && (
              <>
                <div className="flex flex-col space-y-1">
                  <span>Price</span>
                  <input
                    type="number"
                    name="price"
                    step={1}
                    min={0}
                    className="w-[100%] border-2 p-2 rounded-md outline-none"
                    value={inputs?.price ?? ""}
                    onChange={handleInputs}
                    placeholder="Enter Price"
                  />
                </div>

                <div className="flex flex-col py-3 space-y-1 mb-[20px]">
                  <span>Select Vendor</span>
                  <CreatableSelect
                    name="vendor_id"
                    options={vendors}
                    onChange={(option) => {
                      setInputs({ ...inputs, vendor_id: option?.value });
                    }}
                    defaultValue={vendors.find(
                      (option) => option.value === inputs?.vendor_id
                    )}
                    placeholder="Select Vendor"
                    className="react-select-container" // You can customize the class for styling
                    classNamePrefix="react-select" // Prefix for inner classes
                    value={vendors.find(
                      (option) => option.value === inputs?.unit_id
                    )}
                    isClearable
                    onCreateOption={handleCreateVendor}
                  />
                </div>
              </>
            )}

            <div className="flex justify-center space-x-4 w-[100%] mt-[20px]">
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

export default ManageStock;
