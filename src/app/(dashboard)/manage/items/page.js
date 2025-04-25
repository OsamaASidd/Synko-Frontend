"use client";
import React, { useContext, useEffect, useRef } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlobalContext } from "@/context";
import SideMenu from "@/components/menus/SideMenu";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { PulseLoader } from "react-spinners";
import Modal from "@/components/modal";
import CSpinner from "@/components/common/CSpinner";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import {
  IoMdCloseCircleOutline,
  IoMdInformationCircleOutline,
} from "react-icons/io";
import Link from "next/link";
import CAlert from "@/components/common/CAlert";
import { MdOutlineDeleteForever } from "react-icons/md";
import Swal from "sweetalert2";
import { getErrorMessageFromResponse } from "@/utils/helper";
import ProtectedRoute from "@/components/protected-route";
import Button from "@/components/ui/button";
import {
  fetchDataToExport,
  fetchDataToExportTitles,
} from "@/utils/csv_downloader";
import { FaFileExport, FaFileImport } from "react-icons/fa";
import moment from "moment";
import Actions from "@/components/ui/action";
import CustomKeyboard from "@/components/ui/custom-keyboard";
import useCustomKeyboardProps from "@/components/ui/custom-keyboard-props";
import { FormControlLabel, Radio, RadioGroup, Switch } from "@mui/material";
import { inventory_type } from "@/utils/constants";

const ManageModal = ({
  modelIsOpen,
  setIsModalOpen,
  heading = "Modal",
  operation = "add",
  getDataUrl = "",
  postDataUrl = "",
  setIsDataUpdated,
  isDuplicate = false,
}) => {
  const { merchant, user } = useContext(GlobalContext);

  const [alert, setAlert] = useState({ type: "danger", message: "" });
  const [loading, setLoading] = useState(false);

  const [categories, setCategory] = useState([]);
  const getCategoryData = () => {
    getRequest(`/merchant/${merchant?.id}/menus/category`).then((res) => {
      setCategory(
        res?.data.map((cat) => ({
          label: cat.name,
          value: cat.id,
        }))
      );
    });
  };

  const [modifiers, setModifiers] = useState([]);
  const getModifierData = () => {
    getRequest(`/merchant/${merchant?.id}/menus/modification_category`).then(
      (res) => {
        setModifiers(
          res?.data.map((cat) => ({
            label: cat.name,
            value: cat.id,
          }))
        );
      }
    );
  };

  useEffect(() => {
    if (user !== null && merchant !== null) {
      getModifierData();
      getCategoryData();
    }
  }, [user, merchant]);

  const variationIni = {
    name: "",
    sku: "",
    price: "",
  };
  const itemPartIni = {
    part_name: "",
  };
  const initialState = {
    category_id: "",
    name: "",
    image_src: "",
    desc: "",
    price: 0,
    position: "",
    status: 1,
    status_online_store: 1,
    variations: [],
    menu_item_modifications: [],
    item_parts: [],
    is_inventory_manage: false,
    inventory_type: inventory_type.none,
    barcode: "",
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
      console.log("DATA COMING");
      console.log(res?.data);
      setInputs({
        category_id: res?.data.category_id,
        name: res?.data.name,
        image_src: res?.data.image_src,
        desc: res?.data.desc,
        price: res?.data.MenuItemPrice.price,
        position: res?.data?.position,
        status: res?.data?.status,
        status_online_store: +res?.data?.delivery_status,
        variations: res?.data?.variations,
        menu_item_modifications:
          isDuplicate == true && operation == "add"
            ? res?.data?.menu_item_modifications.map(
                (item) => item.modification_category_id
              )
            : res?.data?.menu_item_modifications,
        item_parts: res?.data?.item_parts,
        is_inventory_manage: res?.data?.is_inventory_manage || false,
        inventory_type: res?.data?.inventory_type || inventory_type.none,
        barcode: res?.data?.barcode,
      });
    });
  };

  // console.log("DATA COMING INPUTS");
  console.log(inputs, "===>>>>>DATA COMING INPUTS");

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
        operation == "update"
          ? setIsDataUpdated(res?.data?.data)
          : setIsDataUpdated(true);
        setIsModalOpen(false);
        setInputs(operation == "update" ? res.data.data : initialState);
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
    getUnitData();
  }, [operation, getDataUrl]);

  useEffect(() => {
    if (operation == "add" && isDuplicate == true) {
      getData();
    }
  }, [operation, getDataUrl, isDuplicate]);

  const handleInputs = (event) => {
    if (event.target.type === "file") {
      setInputs((prev) => ({
        ...prev,
        [event.target.name]: event.target.files[0],
      }));
    } else {
      const { name, value, files } = event.target;
      if (name.startsWith("variations")) {
        // Handle variations separately
        const [, index, field] = name.match(/\[(\d+)\]\[(\w+)\]/);
        const variationIndex = parseInt(index, 10);

        setInputs((prev) => ({
          ...prev,
          variations: Array.isArray(prev.variations)
            ? prev.variations.map((variation, i) => {
                if (i === variationIndex) {
                  return {
                    ...variation,
                    [field]: value,
                  };
                }
                return variation;
              })
            : [],
        }));
      } else if (name.startsWith("item_parts")) {
        // Handle variations separately
        const [, index, field] = name.match(/\[(\d+)\]\[(\w+)\]/);
        const itemPartIndex = parseInt(index, 10);

        setInputs((prev) => ({
          ...prev,
          item_parts: Array.isArray(prev.item_parts)
            ? prev.item_parts.map((item_part, i) => {
                if (i === itemPartIndex) {
                  return {
                    ...item_part,
                    [field]: value,
                  };
                }
                return item_part;
              })
            : [],
        }));
      } else {
        setInputs((prev) => ({
          ...prev,
          [event.target.name]: event.target.value,
        }));
      }
    }
  };

  const handleCreateCategory = (value) => {
    setLoading(true);
    postRequest(`/merchant/${merchant?.id}/menus/category`, {
      name: value,
      status: 1,
    })
      .then((res) => {
        const { name, id } = res?.data?.data;
        setCategory((prev) => [...prev, { label: name, value: id }]);
        setInputs({ ...inputs, category_id: res?.data?.data?.id });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const variation_input = (count) => {
    return (
      <div key={count} className="grid grid-cols-4">
        <input
          type="text"
          name={`variations[${count}][name]`}
          value={inputs?.variations[count]?.name ?? ""}
          onChange={handleInputs}
          placeholder="Small"
          className="w-[100%] border-b-2 p-2 outline-none"
        />
        <input
          type="number"
          name={`variations[${count}][sku]`}
          step={1}
          min={0}
          value={inputs?.variations[count]?.sku ?? ""}
          onChange={handleInputs}
          placeholder="SKU"
          className="w-[100%] border-l-2 border-b-2 p-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <input
          type="number"
          name={`variations[${count}][price]`}
          step={0.01}
          min={0}
          value={
            inputs?.variations[count]?.price
              ? inputs?.variations[count]?.price
              : inputs?.variations[count]?.MenuItemPrice?.price ?? ""
          }
          onChange={handleInputs}
          placeholder="Price"
          className="w-[100%] border-l-2 border-b-2 p-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => {
            if (inputs?.variations[count]?.id) {
              setInputs((prevInputs) => {
                const newDataOption = Array.isArray(prevInputs?.variations)
                  ? [...prevInputs.variations]
                  : [];

                if (newDataOption[count]) {
                  newDataOption[count] = {
                    ...newDataOption[count],
                    is_deleted: !inputs?.variations[count]?.is_deleted,
                  };
                }

                return {
                  ...prevInputs,
                  variations: newDataOption,
                };
              });
            } else {
              setInputs((prev) => ({
                ...prev,
                variations: prev.variations.filter((_, i) => i !== count),
              }));
            }
          }}
          className="w-[100%] border-l-2 border-b-2 p-2 outline-none flex justify-center items-center"
        >
          {inputs?.variations[count]?.is_deleted ? (
            <>
              <MdOutlineDeleteForever size={20} className="text-[red]" />
            </>
          ) : (
            <>
              <IoMdCloseCircleOutline size={20} />
            </>
          )}
        </button>
      </div>
    );
  };

  const split_input = (count) => {
    return (
      <div key={count} className="grid grid-cols-4">
        <input
          type="text"
          name={`item_parts[${count}][part_name]`}
          value={inputs?.item_parts[count]?.part_name ?? ""}
          onChange={handleInputs}
          placeholder={`${
            count == 0
              ? "First Half"
              : count == 1
              ? "Second Half"
              : "Split Item Name"
          }`}
          className="w-[100%] border-b-2 p-2 outline-none col-span-3"
        />
        <button
          type="button"
          onClick={() => {
            if (inputs.item_parts[count]?.id) {
              setInputs((prevInputs) => {
                const newDataOption = Array.isArray(prevInputs?.item_parts)
                  ? [...prevInputs.item_parts]
                  : [];

                if (newDataOption[count]) {
                  newDataOption[count] = {
                    ...newDataOption[count],
                    is_deleted: !inputs?.item_parts[count]?.is_deleted,
                  };
                }

                return {
                  ...prevInputs,
                  item_parts: newDataOption,
                };
              });
            } else {
              setInputs((prev) => ({
                ...prev,
                item_parts: prev.item_parts.filter((_, i) => i !== count),
              }));
            }
          }}
          className="w-[100%] border-l-2 border-b-2 p-2 outline-none flex justify-center items-center"
        >
          {inputs?.item_parts[count]?.is_deleted == true ? (
            <>
              <MdOutlineDeleteForever size={20} className="text-[red]" />
            </>
          ) : (
            <>
              <IoMdCloseCircleOutline size={20} />
            </>
          )}
        </button>
      </div>
    );
  };

  const isObject = (value) => {
    return value && typeof value === "object" && value.constructor === Object;
  };

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
  } = useCustomKeyboardProps(inputs, setInputs, true);

  const [isInfoOpen, setIsInfoOpen] = useState(false);

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
            <div className="flex flex-col py-3 space-y-1">
              <span>Name*</span>
              <input
                type="text"
                name="name"
                required
                value={inputs?.name ?? ""}
                onChange={handleInputs}
                placeholder="Enter Item Name"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                onFocus={() => {
                  setIsNumericType(false);
                  handleInputFocus("name");
                }}
                readOnly={os == "android" && isVisible == true ? true : false}
              />
            </div>

            <div className="flex flex-col py-3 space-y-1">
              <span>Select Category*</span>
              <CreatableSelect
                name="category_id"
                options={categories}
                onChange={(option) => {
                  handleInputs({
                    target: { name: "category_id", value: option?.value ?? "" },
                  });
                }}
                defaultValue={categories.find(
                  (option) => option.value === inputs?.category_id
                )}
                placeholder="Select Category"
                className="react-select-container" // You can customize the class for styling
                classNamePrefix="react-select" // Prefix for inner classes
                value={categories.find(
                  (option) => option.value === inputs?.category_id
                )}
                isClearable
                onCreateOption={handleCreateCategory}
              />
            </div>

            <div className="flex flex-col py-3 space-y-1">
              <span>Description</span>
              <textarea
                type="text"
                name="desc"
                value={inputs?.desc ?? ""}
                onChange={handleInputs}
                placeholder="Enter Item Description"
                className="w-[100%] border-2 p-2 rounded-md outline-none resize-none"
                onFocus={() => {
                  setIsNumericType(false);
                  handleInputFocus("desc");
                }}
                readOnly={os == "android" && isVisible == true ? true : false}
              ></textarea>
            </div>

            {operation == "update" && (
              <div className="flex flex-col py-3 space-y-1">
                <span>Postion*</span>
                <input
                  type="number"
                  name="position"
                  value={inputs?.position ?? ""}
                  onChange={handleInputs}
                  placeholder="Enter Position"
                  className="w-[100%] border-2 p-2 rounded-md outline-none"
                  required
                  onFocus={() => {
                    setIsNumericType(true);
                    handleInputFocus("position");
                  }}
                  readOnly={os == "android" && isVisible == true ? true : false}
                />
              </div>
            )}

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

            <div className="flex flex-col py-3 space-y-1">
              <span>Select Visibility Status (Online Site)*</span>
              <select
                name="status_online_store"
                onChange={handleInputs}
                placeholder="Select Status"
                className="h-[40px] border-2 rounded-md px-[8px]"
                required
                value={inputs?.status_online_store}
              >
                <option value={1}>Active</option>
                <option value={2}>Disable</option>
              </select>
            </div>

            <div className="flex flex-col py-3 space-y-1">
              <span>Item Price*</span>
              <input
                type="number"
                name="price"
                step={0.01}
                min={0}
                required
                value={inputs?.price ?? ""}
                onChange={handleInputs}
                placeholder="Enter Item Cost"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                onFocus={() => {
                  setIsNumericType(true);
                  handleInputFocus("price");
                }}
                readOnly={os == "android" && isVisible == true ? true : false}
              />
            </div>

            {/* <div className="flex flex-col py-3 space-y-1">
              <h3 className="font-[700] text-[15px]">Variations</h3>
              <p className="text-justify text-[12px]">
                Expand your {"menu's"} versatility by introducing variations to
                each item, such as different sizes, to cater to a wider range of
                customer preferences.
              </p>
            </div>

            {inputs?.variations?.length > 0 ? (
              <>
                <div className="flex flex-col pb-3 space-y-1">
                  <div className="grid grid-cols-4 gap-4 font-[600] text-[14px] border-b-2">
                    <span>Variation</span>
                    <span>SKU</span>
                    <span>Price</span>
                  </div>
                  <div>
                    {inputs?.variations?.map((res, index) =>
                      variation_input(index)
                    )}
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}
            <button
              type="button"
              onClick={() => {
                setInputs({
                  ...inputs,
                  variations: [...inputs.variations, variationIni],
                });
              }}
              className="border border-black w-full px-3 py-2 rounded-[8px] mb-[30px]"
            >
              Add Variation
            </button> */}

            <div className="flex flex-col py-3 space-y-1">
              <h3 className="font-[700] text-[15px]">Modifiers</h3>
              <p className="text-justify text-[12px] !mb-[10px]">
                Add a custom set of modifiers to have customizable options for
                an item at checkout, such as toppings, add-ons, or special
                requests.
              </p>
              <p className="text-justify text-[12px]">
                Select modifier sets to apply to this item. Create new or manage
                existing modifier sets in Items {">"} Modifiers.{" "}
                <Link
                  href="/manage/modifiers"
                  className="text-[#005ad9] cursor-pointer font-[600]"
                >
                  Go to Modifiers
                </Link>
              </p>
            </div>

            <Select
              isMulti
              name="colors"
              options={modifiers}
              className="basic-multi-select"
              classNamePrefix="select"
              value={
                operation === "update"
                  ? modifiers.filter((modifier) =>
                      inputs?.menu_item_modifications?.some((mod) =>
                        isObject(mod)
                          ? mod.modification_category_id === modifier.value
                          : mod === modifier.value
                      )
                    )
                  : modifiers.filter((modifier) =>
                      inputs?.menu_item_modifications?.includes(modifier.value)
                    )
              }
              placeholder="Add Modifiers"
              onChange={(selectedOptions) => {
                setInputs((prev) => ({
                  ...prev,
                  menu_item_modifications: selectedOptions.map(
                    (option) => option.value
                  ),
                }));
              }}
            />

            {/* <div className="flex flex-col py-3 space-y-1">
              <h3 className="font-[700] text-[15px]">Split Item</h3>
              <p className="text-justify text-[12px]">
                Revamp your menu by allowing customers to mix and match flavors
                or ingredients on one dish. Perfect for adding variety and
                catering to individual tastes in every order.
              </p>
            </div>

            {inputs?.item_parts?.length > 0 ? (
              <>
                <div className="flex flex-col pb-3 space-y-1">
                  <div className="grid grid-cols-2 gap-4 font-[600] text-[14px] border-b-2">
                    <span>Name</span>
                  </div>
                  <div>
                    {inputs?.item_parts?.map((res, index) =>
                      split_input(index)
                    )}
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}
            <button
              type="button"
              onClick={() => {
                setInputs({
                  ...inputs,
                  item_parts: [...inputs.item_parts, itemPartIni],
                });
              }}
              className="border border-black w-full px-3 py-2 rounded-[8px] mb-[30px]"
            >
              Split Item
            </button> */}

            <div className="flex flex-col py-3 space-y-1 my-[10px]">
              {/* <span>Upload Item Image</span>
              <input
                type="file"
                name="image_src"
                onChange={handleInputs}
                placeholder="Upload Item Image"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
              /> */}
              <label htmlFor="file-upload" className="block mb-2 font-medium">
                Upload Item Image
              </label>
              <div className="flex items-center gap-2 border p-2 rounded-md cursor-pointer">
                <input
                  id="file-upload"
                  name="image_src"
                  type="file"
                  onChange={handleInputs}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-gray-200 px-3 py-1 rounded-md cursor-pointer"
                >
                  Choose File
                </label>
                <span>
                  {typeof inputs?.image_src === "string"
                    ? inputs.image_src // **Agar string hai toh yeh show hoga (edit mode)**
                    : inputs?.image_src?.name || "No file selected"}{" "}
                  {/* **Agar file object hai toh sirf name show hoga** */}
                </span>
              </div>
            </div>
            {/* {inputs?.image_src && <div>{inputs?.image_src?.name}</div>} */}

            <div className="flex justify-between items-center">
              <div className="mr-5 flex flex-col justify-center">
                <span>Inventory Management</span>
                <span className="text-[12px]">
                  Do you want to manage inventory for this item?
                </span>
              </div>
              <div>
                <Switch
                  onChange={(e) => {
                    setInputs({
                      ...inputs,
                      is_inventory_manage: !inputs?.is_inventory_manage,
                    });
                  }}
                  checked={inputs?.is_inventory_manage}
                />
              </div>
            </div>

            {inputs.is_inventory_manage == true ? (
              <>
                <div className="flex flex-col py-3 space-y-1 my-[10px]">
                  <span>Inventory Type</span>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    defaultChecked={inputs.inventory_type}
                    className="capitalize"
                  >
                    <FormControlLabel
                      value={inventory_type.recipe}
                      control={<Radio />}
                      label={inventory_type.recipe}
                      name="inventory_type"
                      onChange={handleInputs}
                      checked={inputs.inventory_type == inventory_type.recipe}
                    />
                    <FormControlLabel
                      value={inventory_type.standalone}
                      control={<Radio />}
                      label={inventory_type.standalone}
                      name="inventory_type"
                      onChange={handleInputs}
                      checked={
                        inputs.inventory_type == inventory_type.standalone
                      }
                    />
                  </RadioGroup>
                </div>
              </>
            ) : null}

            <div className="flex flex-col py-3 space-y-1">
              <span
                onClick={() => {
                  setIsInfoOpen(!isInfoOpen);
                }}
                className="flex items-center gap-x-[5px] cursor-pointer"
              >
                Scan Barcode Here <IoMdInformationCircleOutline />
              </span>
              {isInfoOpen == true && (
                <p className="text-[12px]">
                  Use your scanner prefix{" "}
                  <span className="text-neutral-800">(]SE0)</span> while typing
                  the barcode or just tap on the input and scan the code
                  directly using scanner!
                </p>
              )}
              <input
                type="text"
                name="barcode"
                value={inputs?.barcode ?? ""}
                onChange={handleInputs}
                placeholder="Scan Barcode Here"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
              />
            </div>

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

export default function Items() {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);
  const router = useRouter();
  const [modelIsOpen, setIsModalOpen] = useState(false);
  const [currentModalData, setCurrentModalData] = useState(null);

  const [data, setData] = useState([]);

  const [pageCurrent, setPageCurrent] = useState(1);
  const [metaData, setMetaData] = useState();
  const initalRender = useRef(false);

  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [dataUpdated, setIsDataUpdated] = useState(null);
  const [search, setSearch] = useState(null);

  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const getCategoryData = () => {
    getRequest(`/merchant/${merchant?.id}/menus/category`).then((res) => {
      setCategories(res?.data);
    });
  };

  const getData = () => {
    let url;
    if (search) {
      url = `/merchant/${merchant?.id}/menus/item?page=${pageCurrent}&search=${search}`;
    } else if (selectedCategory) {
      url = `/merchant/${merchant?.id}/menus/item?page=${pageCurrent}&category_id=${selectedCategory}`;
    } else if (search && selectedCategory) {
      url = `/merchant/${merchant?.id}/menus/item?page=${pageCurrent}&search=${search}&category_id=${selectedCategory}`;
    } else {
      url = `/merchant/${merchant?.id}/menus/item?page=${pageCurrent}`;
    }
    getRequest(
      `/merchant/${merchant?.id}/menus/item?page=${pageCurrent}&search=${search}&category_id=${selectedCategory}`
    )
      .then((res) => {
        if (dataUpdated?.id) {
          setData((prevData) => {
            const updatedData = prevData.map((item) => {
              if (item.id === dataUpdated.id) {
                // Replace the item with the same ID
                return dataUpdated;
              }
              return item;
            });
            return updatedData;
          });
          setIsDataUpdated(false);
          return;
        }
        if (pageCurrent == 1) {
          setData(res?.data?.data);
          setMetaData(res?.data?.meta);
        } else {
          setData((prevData) => {
            return [...prevData, ...res?.data?.data];
          });
          setMetaData(res.data.meta);
        }
      })
      .finally(() => {
        setPageLevelLoader(false);
        setIsDataUpdated(false);
      });
  };

  const handleDelete = (id) => {
    setLoading(true);
    setSelectedId(id);
    postRequest(`/merchant/${merchant?.id}/menus/item/${id}`, {}, "delete")
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
    if (merchant.id !== undefined && user) getData();
  }, [user, merchant, search, selectedCategory]);

  useEffect(() => {
    if (merchant.id !== undefined && user) getCategoryData();
  }, [user, merchant]);

  useEffect(() => {
    if (initalRender.current) {
      getData();
    } else {
      initalRender.current = true;
    }
  }, [pageCurrent]);

  useEffect(() => {
    if (dataUpdated !== false && dataUpdated !== null) {
      getData();
    }
  }, [dataUpdated]);

  const handleModal = (data) => {
    // Step 1: Close the modal and reset the state
    setIsModalOpen(false);
    setCurrentModalData({
      heading: "",
      operation: "",
      getDataUrl: "",
      postDataUrl: "",
      setIsDataUpdated: "",
    });

    // Step 2: Use a callback to set the new state and reopen the modal
    setTimeout(() => {
      setCurrentModalData(data);
      setIsModalOpen(true);
    }, 0);
  };

  const handleLoadMore = () => {
    if (pageCurrent >= metaData?.last_page) {
      setPageCurrent(pageCurrent);
      return;
    }
    setPageCurrent(pageCurrent + 1);
  };

  // CSV IMPORT WORK
  const [csvData, setCsvData] = useState([]);

  const handleFileChange = (event) => {
    setImportLoading(true);
    const file = event.target.files[0];
    if (file) {
      readCsvFile(file);
    }
  };

  const readCsvFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      parseCsv(csvText);
    };
    reader.readAsText(file);
  };

  const parseCsv = (csvText) => {
    const rows = csvText.split("\n").filter(Boolean); // Splitting rows and removing empty lines
    const headers = rows[0].split(","); // Extracting headers
    const data = rows.slice(1).map((row) => {
      const values = row.split(",");
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index].trim(); // Building object row by row
        return obj;
      }, {});
    });

    postRequest(`/merchant/${merchant?.id}/import/menu/data`, {
      data: data,
    })
      .then((res) => {
        Swal.fire({ text: "Data imported!", icon: "success" });
        getData();
      })
      .catch((err) => {
        getErrorMessageFromResponse(err);
      })
      .finally(() => {
        setImportLoading(false);
      });

    setCsvData(data);
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
    <ProtectedRoute pageName={"menu-items"}>
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
            isDuplicate={currentModalData?.isDuplicate}
          />
        )}

        <div className="w-[100%] xl:ml-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6 h-screen overflow-auto text-black bg-[#171821]">
          <div className="w-[100%] h-[calc(100vh-48px)] overflow-y-auto  bg-[#F8F8F8] rounded-[20px] py-10 lg:p-10 px-3 md:px-8 lg:pr-16">
            <div className="w-[100%] border-b-2 text-[24px] py">
              Manage Items
            </div>
            <div className="w-[100%] flex flex-col md:flex-row items-end justify-between py-5 gap-4 md:items-center">
              <div className=" flex flex-col md:flex-row gap-y-3 md:gap-y-0 gap-x-[10px] w-[100%]">
                <input
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  required
                  className="border p-3 sm:p-4 placeholder:text-[14px] sm:placeholder:text-[16px] w-[100%] md:w-[45%] rounded-[15px] bg-[#F8F8F8] outline-none"
                  placeholder="Search by category, Items"
                />
                <select
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                  }}
                  className="border p-3 sm:p-4 placeholder:text-[14px] sm:placeholder:text-[16px] w-[100%] md:w-[45%] rounded-[15px] bg-[#F8F8F8] outline-none"
                >
                  <option value="">Select Category</option>
                  {categories?.length > 0 && (
                    <>
                      {categories.map((item, index) => (
                        <>
                          <option key={index} value={item?.id}>
                            {item?.name}
                          </option>
                        </>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <button
                onClick={() => {
                  handleModal({
                    heading: "Add New Item",
                    operation: "add",
                    getDataUrl: "",
                    postDataUrl: "menus/item",
                  });
                }}
                id="shadow"
                className="bg-white w-full sm:w-[150px] px-4 py-2 text-[14px] rounded-[10px] flex items-center whitespace-nowrap space-x-3"
              >
                <img src="/images/Vector1.png" />
                <p>Add Item</p>
              </button>
            </div>
            <div className="flex flex-wrap justify-end mb-[10px] relative gap-2 sm:gap-4 w-full">
              <div className="w-full sm:w-full md:w-[200px]">
                <label
                  htmlFor="fileUpdate"
                  className="cursor-pointer w-full flex gap-[10px] justify-center items-center bg-[#fff] border-2 border-[#055938] text-[#000] py-[10px] px-[30px] rounded-full button-shadow"
                >
                  {importLoading == true ? (
                    <>
                      <CSpinner color="text-[#055938]" />
                    </>
                  ) : (
                    <>
                      <FaFileImport color="#055938" /> Import
                    </>
                  )}
                </label>
                <input
                  id="fileUpdate"
                  type="file"
                  className=" w-full"
                  accept=".csv"
                  onChange={handleFileChange}
                  hidden
                />
              </div>

              <Button
                onClick={() => {
                  if (exportLoading == true) return;
                  fetchDataToExport({
                    setExportLoading,
                    exportUrl: `/merchant/${merchant?.id}/export/menu/data`,
                    name: `item_exported_${moment().format("MMM-D-YYYY")}`,
                  });
                }}
                className="w-full sm:w-full md:w-[200px] flex gap-[10px] justify-center items-center"
              >
                {exportLoading == true ? (
                  <>
                    <CSpinner color="text-[#055938]" />
                  </>
                ) : (
                  <>
                    <FaFileExport color="#055938" /> Export
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  if (exportLoading == true) return;
                  fetchDataToExportTitles({
                    setExportLoading,
                    exportUrl: `/merchant/${merchant?.id}/export/menu/columnsdata`,
                    name: `item_exported_${moment().format("MMM-D-YYYY")}`,
                  });
                }}
                className="w-full md:w-[200px] flex gap-[10px] justify-center items-center"
              >
                {exportLoading == true ? (
                  <>
                    <CSpinner color="text-[#055938]" />
                  </>
                ) : (
                  <>
                    <FaFileExport color="#055938" /> Template
                  </>
                )}
              </Button>
            </div>

            <div className="relative pb-[60px]">
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-[#055938] text-[#ffffff]">
                    <th className="px-7 py-3 text-[18px] font-medium">Name</th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Category
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">Price</th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Menu Position
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Status
                    </th>
                    <th className="px-7 py-3 text-[18px] font-medium">
                      Site Status
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
                            {item?.name}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.category?.name}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.MenuItemPrice?.price ?? 0}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.position}
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
                            {item?.delivery_status == 1 ? (
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
                                  title: "View Recipe",
                                  func: () =>
                                    router.push(
                                      `/manage/items/recipe/${item?.id}`
                                    ),
                                },
                                {
                                  title: "Edit",
                                  func: () =>
                                    handleModal({
                                      heading: "Update Item",
                                      operation: "update",
                                      getDataUrl: `menus/item/${item?.id}`,
                                      postDataUrl: `menus/item/${item?.id}`,
                                    }),
                                },
                                {
                                  title: "Duplicate Item",
                                  func: () =>
                                    handleModal({
                                      heading: "Add Item",
                                      operation: "add",
                                      getDataUrl: `menus/item/${item?.id}`,
                                      postDataUrl: "menus/item",
                                      isDuplicate: true,
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
                                      <Link
                                        href={`/manage/items/recipe/${item?.id}`}
                                        className="block px-4 py-2 hover:bg-gray-100 w-[100%] text-black"
                                      >
                                        View Recipe
                                      </Link>
                                      <button
                                        onClick={() => {
                                          handleModal({
                                            heading: "Update Item",
                                            operation: "update",
                                            getDataUrl: `menus/item/${item?.id}`,
                                            postDataUrl: `menus/item/${item?.id}`,
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
              {pageCurrent >= metaData?.last_page ? (
                <></>
              ) : (
                <>
                  <div className="my-[20px] flex justify-center">
                    <button
                      onClick={() => {
                        handleLoadMore();
                      }}
                      className="cursor-pointer px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                    >
                      Load More
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
