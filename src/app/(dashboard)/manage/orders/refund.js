"use client";
import CSpinner from "@/components/common/CSpinner";
import { GlobalContext } from "@/context";
import { postRequest, postRequestpos } from "@/utils/apiFunctions";
import React, { useContext, useEffect, useState } from "react";
import { AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";
import Swal from "sweetalert2";

const Refund = ({ isOpenRefunded, setIsOpenRefunded, setTrigger }) => {
  const { merchant } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("full_order");
  const [checkedProducts, setCheckedProducts] = useState([]);
  const {
    id,
    order_date,
    customer,
    gross_total,
    net_amount,
    order_items,
    order_splits,
    discount,
    deliveryCharges,
  } = isOpenRefunded;

  const [inputs, setInputs] = useState({
    merchant_id: merchant?.id,
    order_id: id,
    per_product: selectedOption,
  });
  useEffect(() => {
    if (merchant?.id && id) {
      setInputs((prev) => ({
        ...prev,
        merchant_id: merchant?.id,
        order_id: id,
        per_product: selectedOption,
        orderItemsAry: checkedProducts,
      }));
    }
  }, [merchant, isOpenRefunded, checkedProducts, selectedOption]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    postRequestpos(`/merchant/order/refund`, inputs)
      .then((res) => {
        Swal.fire({ icon: "success", text: res?.isOpenRefunded?.message });
        setIsOpenRefunded(null);
        setTrigger(true);
      })
      .catch((error) => {
        Swal.fire({ icon: "error", text: error.message });
      })
      .finally(() => {
        // setTriggerGetData(true);
        setLoading(false);
      });
  };

  const handleCheckboxChange = (products) => {
    if (
      checkedProducts.some((product) => product.id === products.order_item_id)
    ) {
      setCheckedProducts((prev) =>
        prev.filter((product) => product.id !== products.order_item_id)
      );
    } else {
      setCheckedProducts((prev) => [
        ...prev,
        { id: products.order_item_id, qty: products.quantity },
      ]);
    }
  };

  useEffect(() => {
    // If all products are checked and quantities match, change status to full_order
    const filteredItems = isOpenRefunded?.order_items.filter((item) => item.status !== 6);

    // Check if every checked product matches an item in filteredItems with the same id and quantity
    const allChecked =
      checkedProducts.length === filteredItems?.length &&
      checkedProducts.every((checkedProduct) => {
        const matchingItem = filteredItems.find(
          (item) => item.order_item_id === checkedProduct.id
        );
        return matchingItem && matchingItem.quantity === checkedProduct.qty;
      });

    if (allChecked && selectedOption === "by_product") {
      setSelectedOption("full_order");
    }
  }, [checkedProducts, isOpenRefunded, selectedOption]);

  const handleQuantityChange = (productQuantity, productId, qty) => {
    if (qty > 0) {
      if (qty <= productQuantity) {
        setCheckedProducts((prev) =>
          prev.map((product) =>
            product.id === productId ? { ...product, qty: qty } : product
          )
        );
      }
    }
  };

  // Initialize filteredProducts
  const filteredProducts =
    selectedOption === "by_product" && isOpenRefunded?.order_items
      ? isOpenRefunded.order_items
      : []; // Default to an empty array

  console.log(filteredProducts, "<------filteredProducts");
  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full gap-4"
      >
        <span className="text-[#656565] text-[18px]">
          Select a status for this order
        </span>
        <div className="flex flex-col items-center w-full gap-4">
          <select
            className="w-full outline-none border-2 py-3 rounded-lg"
            value={selectedOption}
            onChange={(e) => {
              setSelectedOption(e.target.value);
              setCheckedProducts([]); // Reset checked products when changing option
            }}
          >
            <option value="full_order">Full Order</option>
            <option value="by_product">By Products</option>
          </select>
          {selectedOption == "by_product" && (
            <div className="flex flex-col gap-2 w-full">
              {/* Render products here based on the selected option */}
              {filteredProducts.map((item) =>
                item.status !== 6 ? (
                  <div key={item.order_item_id}>
                    <div className="flex gap-2 w-full justify-between">
                      <div className="flex gap-2 justify-between">
                        <input
                          onChange={() => handleCheckboxChange(item)}
                          type="checkbox"
                          checked={checkedProducts.some(
                            (product) => product.id === item.order_item_id
                          )}
                          className="w-5"
                        />
                        <span>{item.name}</span>
                      </div>
                      {checkedProducts.some(
                        (product) => product.id === item.order_item_id
                      ) && (
                        <div className="bg-white flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              handleQuantityChange(
                                item.quantity,
                                item.order_item_id,
                                checkedProducts.find(
                                  (product) => product.id === item.order_item_id
                                ).qty - 1
                              );
                            }}
                          >
                            <AiFillMinusCircle
                              className="text-white bg-[#18D89D] rounded-full"
                              size={20}
                            />
                          </button>
                          <span>
                            {
                              checkedProducts.find(
                                (product) => product.id === item.order_item_id
                              ).qty
                            }
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              handleQuantityChange(
                                item.quantity,
                                item.order_item_id,
                                checkedProducts.find(
                                  (product) => product.id === item.order_item_id
                                ).qty + 1
                              );
                            }}
                          >
                            <AiFillPlusCircle
                              className="text-white bg-[#18D89D] rounded-full"
                              size={20}
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="border-2 py-3 w-[100%] bg-gradient-to-r from-[#7DE143] to-[#055938] font-bold rounded-lg text-white text-center"
        >
          {loading ? <CSpinner /> : "Refund"}
        </button>
      </form>
    </div>
  );
};

export default Refund;
