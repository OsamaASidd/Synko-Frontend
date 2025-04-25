"use client";
import SideMenu from "@/components/menus/SideMenu";
import { GlobalContext } from "@/context";
import { useContext, useEffect, useState } from "react";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { BsThreeDots } from "react-icons/bs";
import Modal from "@/components/custome_modals/addTimingModal";
import CSpinner from "@/components/common/CSpinner";
import { getErrorMessageFromResponse } from "@/utils/helper";
import Swal from "sweetalert2";
import { IoArrowBackOutline } from "react-icons/io5";
import Link from "next/link";

export default function Dipatch({ params }) {
  const { merchant, user, setMerchant } = useContext(GlobalContext);
  const [menu_item_id, setMenuItemId] = useState(params.item);
  const [ingredientsData, setingredientsData] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [search, setSearch] = useState("");
  const [isOpenModal, setOpenModal] = useState(false);
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ingrdientOptions, setIngredientOptions] = useState([]);
  const [allUnits, setAllUnits] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedIngredient, setSelectIngredient] = useState("");
  const [pageCurrent, setPageCurrent] = useState(1);
  const [metaData, setMetaData] = useState();
  const [modalHeading, setModalHeading] = useState("add");
  const [idToDLT, setIdToDLT] = useState("");

  const [inputs, setInputs] = useState({
    ingredient: selectedIngredient,
    quantity: "",
    unit: selectedUnit,
  });

  const getIngredients = () => {
    let url = `/merchant/${merchant?.id}/get_ingredient?menu_item_id=${menu_item_id}&page=${pageCurrent}&search=${search}`;
    getRequest(url).then((res) => {
      if (res?.status == 200) {
        if (pageCurrent == 1) {
          setingredientsData(res?.data?.data?.data);
          setMetaData(res?.data?.data?.meta);
        } else {
          setingredientsData((prevData) => {
            return [...prevData, ...res?.data?.data?.data];
          });
          setMetaData(res?.data?.data?.meta);
        }
      }
    });
  };

  // get units
  const getUnits = () => {
    let url = `/user/get-unit`;
    getRequest(url, true).then((res) => {
      if (res?.status == 200) {
        setAllUnits(res?.data);
      }
    });
  };

  const getInventories = () => {
    let url = `/merchant/${merchant?.id}/inventory`;
    getRequest(url).then((res) => {
      if (res?.status == 200) {
        setInventories(res?.data);
        let options = [];
        if (res?.data?.length > 0) {
          res?.data.forEach((element) => {
            let obj = {
              id: element?.id,
              name: element?.name,
            };
            options.push(obj);
          });
        }
        options.unshift({ id: 0, name: "Select Ingredient" });
        setIngredientOptions(options);
      }
    });
  };

  useEffect(() => {
    if (merchant && user) {
      getIngredients();
      getInventories();
      getUnits();
    }
  }, [merchant, user]);

  useEffect(() => {
    if (merchant && user) {
      getIngredients();
    }
  }, [merchant, user, search, pageCurrent]);

  // selectedUnit
  // const [selectedUnit, setSelectedUnit] = useState("")
  // const [selectedIngredient, setSelectIngredient] = useState("")
  const handleSelectIngredient = (id) => {
    const value = id;

    let exactIngredient = inventories.find((item) => item?.id == value);
    setSelectIngredient(exactIngredient);
    if (exactIngredient?.unit?.name == "Kilogram") {
      let gramUnit = allUnits.find((item) => item?.name == "gram");
      setSelectedUnit(gramUnit);
    } else {
      let exactUnit = allUnits.find(
        (item) => item?.id == exactIngredient?.unit.id
      );
      setSelectedUnit(exactUnit);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let payload = {
      quantity: parseFloat(inputs?.quantity),
      ingredient_id: selectedIngredient?.id,
      item_id: parseInt(menu_item_id),
      unit_id: selectedUnit?.id,
    };

    if (modalHeading == "edit") {
      editIngredients(payload);
    } else {
      addIngredients(payload);
    }
  };

  const addIngredients = (payload) => {
    setLoading(true);
    let url = `/merchant/${merchant?.id}/add_ingredient`;
    postRequest(url, payload)
      .then((res) => {
        if (res?.status == 200) {
          Swal.fire({
            text: res.data.message,
            icon: "success",
          });
          getIngredients();

          setTimeout(() => {
            setOpenModal(false);
          });
        } else {
          Swal.fire({
            text: res.data.message,
            icon: "error",
          });
        }
      })
      .catch((err) => {
        getErrorMessageFromResponse(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const editIngredients = (payload) => {
    setLoading(true);
    let url = `/merchant/${merchant?.id}/edit_ingredient`;

    let updatedPayload = {
      menu_item_ingredients_id: idToDLT,
      quantity: payload?.quantity,
    };
    postRequest(url, updatedPayload)
      .then((res) => {
        if (res?.status == 200) {
          Swal.fire({
            text: res.data.message,
            icon: "success",
          });
          getIngredients();

          setTimeout(() => {
            setOpenModal(false);
          });
        } else {
          Swal.fire({
            text: res.data.message,
            icon: "error",
          });
        }
      })
      .catch((err) => {
        getErrorMessageFromResponse(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteIngredient = (payload) => {
    setLoading(true);
    let url = `/merchant/${merchant?.id}/delete_ingredient`;
    postRequest(url, payload)
      .then((res) => {
        if (res?.status == 200) {
          Swal.fire({
            text: res.data.message,
            icon: "success",
          });
          getIngredients();
        } else {
          Swal.fire({
            text: res.data.message,
            icon: "error",
          });
        }
      })
      .catch((err) => {
        getErrorMessageFromResponse(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDeleteIngredient = (id) => {
    deleteIngredient({ menu_item_ingredients_id: id });
  };

  const handleLoadMore = () => {
    if (pageCurrent >= metaData?.last_page) {
      setPageCurrent(pageCurrent);
      return;
    }
    setPageCurrent(pageCurrent + 1);
  };

  const handleEditModal = (id) => {
    let exactIngredient = ingredientsData.find((item) => item?.id == id);
    setSelectIngredient(exactIngredient?.ingredient);
    setSelectedUnit(exactIngredient?.unit);
    setInputs({
      ingredient: exactIngredient?.ingredient?.id,
      quantity: exactIngredient?.quantity,
      unit: exactIngredient?.unit?.id,
    });
  };

  return (
    <div className="min-h-screen flex bg-[#171821] relative">
      <SideMenu />

      <div className=" w-[100%] xl:pl-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6  text-black bg-[#171821]">
        <div className=" px-4 md:px-10 rounded-lg py-12 bg-gray-50 w-[100%] h-[calc(100vh-48px)] overflow-y-auto">
          <div className="flex">
            <Link
              href="/manage/items"
              className="rounded-full w-[50px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white text-[25px] flex items-center justify-center"
            >
              <IoArrowBackOutline />
            </Link>
            <p className="text-[28px] md:text-[33px] uppercase ml-3">
              View Recipe
            </p>
          </div>

          <hr className="mt-4" />
          <div className="w-[100%] flex justify-between py-5 gap-4 items-center">
            <div className="flex gap-x-[10px] w-[100%]">
              <input
                onChange={(e) => {
                  setTimeout(() => {
                    setSearch(e.target.value);
                  }, 500);
                }}
                required
                className="border p-4 w-[100%] sm:w-[50%] rounded-[15px] bg-[#F8F8F8] outline-none"
                placeholder="Search Ingredients"
              />
            </div>

            <button
              onClick={() => {
                setSelectIngredient("");
                setSelectedUnit("");
                setInputs({
                  ingredient: selectedIngredient,
                  quantity: "",
                  unit: selectedUnit,
                });
                setModalHeading("add");
                setOpenModal(true);
              }}
              id="shadow"
              className="bg-white w-[150px] px-4 py-2 text-[14px] rounded-[10px] flex space-x-3"
            >
              <img src="/images/Vector1.png" />
              <p>Add Item</p>
            </button>
          </div>

          <div className="relative overflow-x-auto min-h-screen h-full overflow-y-hidden">
            <table className="w-full border text-left">
              <thead>
                <tr className="bg-[#055938] text-[#ffffff]">
                  <th className="px-7 py-3 text-[18px] font-medium">
                    Ingredients
                  </th>
                  <th className="px-7 py-3 text-[18px] font-medium">
                    Quantity
                  </th>
                  <th className="px-7 py-3 text-[18px] font-medium">Units</th>
                  <th className="px-7 py-3 text-[18px] font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {ingredientsData?.length > 0 ? (
                  <>
                    {" "}
                    {ingredientsData.map((item, index) => {
                      return (
                        <tr
                          key={index}
                          className="border-b bg-white text-[14px]"
                        >
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.ingredient?.name}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.quantity}
                          </td>
                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                            {item?.unit?.name}
                          </td>

                          <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
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
                                          setModalHeading("edit");
                                          setOpenModal(true);
                                          setIdToDLT(item?.id);
                                          handleEditModal(item?.id);
                                        }}
                                        className="block px-4 py-2 hover:bg-gray-100 w-[100%]"
                                      >
                                        Edit
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        onClick={() => {
                                          handleDeleteIngredient(item?.id);
                                        }}
                                        className="block px-4 py-2 hover:bg-gray-100 w-[100%]"
                                      >
                                        Delete
                                      </button>
                                    </li>
                                  </ul>
                                </nav>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </>
                ) : (
                  <></>
                )}
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

      {/* modal */}
      <Modal
        isOpen={isOpenModal}
        setIsOpen={setOpenModal}
        heading={modalHeading == "add" ? "Add Ingredient" : "Edit Ingredient"}
      >
        <form onSubmit={handleSubmit} className="p-4">
          <div className="px-4"></div>

          <div className="w-[100%] text-[14px] text-black">
            <div className="flex flex-col py-3 space-y-1">
              <span>Select Ingredient*</span>
              <select
                id="sort-by"
                name="ingredient"
                onChange={(e) => {
                  handleSelectIngredient(e?.target?.value);
                }}
                className="w-[100%] p-2 border outline-none rounded-lg"
                value={selectedIngredient?.id ?? ""}
                disabled={selectedIngredient?.id ? true : false}
              >
                {ingrdientOptions?.length > 0 ? (
                  <>
                    {ingrdientOptions?.map((item, index) => {
                      return (
                        <option key={index} value={item?.id}>
                          {item?.name}
                        </option>
                      );
                    })}
                  </>
                ) : (
                  <></>
                )}
              </select>
            </div>
          </div>
          <div className="w-[100%] text-[14px] text-black">
            <div className="flex flex-col py-3 space-y-1">
              <span>Units*</span>
              <input
                type="text"
                name="units"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                placeholder={selectedUnit?.name}
                readOnly
              />
            </div>
          </div>

          <div className="w-[100%] text-[14px] text-black">
            <div className="flex flex-col py-3 space-y-1">
              <span>
                Quantity*(
                {selectedUnit?.code != null ? selectedUnit?.code : "Per Item"})
              </span>
              <input
                type="number"
                name="quantity"
                className="w-[100%] border-2 p-2 rounded-md outline-none"
                placeholder={`${
                  selectedUnit?.name != undefined
                    ? `Enter Quantity in ${selectedUnit?.name}`
                    : "Select Ingredient first"
                }`}
                onChange={handleChange}
                value={inputs?.quantity}
              />
            </div>
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
        </form>
      </Modal>
    </div>
  );
}
