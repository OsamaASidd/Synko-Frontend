"use client";

import Modal from "@/components/modal";
import ClickButton from "../ClickButton";
import { useContext, useEffect, useState } from "react";
import { postRequest } from "@/utils/apiFunctions";
import { GlobalContext } from "@/context";
import { AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";
import Swal from "sweetalert2";
import CSpinner from "@/components/common/CSpinner";

const LoadingSkeleton = () => {
  return (
    <>
      {[...new Array(4)].map((_, index) => (
        <li key={index} className="animate-pulse">
          <ClickButton classes="!h-[45px]" onClick={() => {}} name={""} />
        </li>
      ))}
    </>
  );
};

export default function Refunded({
  setModals,
  modals,
  orderType,
  setOrderType,
  model_ids,
  setRefunded,
  orderProduct,
  setOrderProduct,
  order_id,
}) {
  const { merchant } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("full_order");
  const [checkedProducts, setCheckedProducts] = useState([]);
  const [isRequiredPin, setIsRequiredPin] = useState(false);

  const [inputs, setInputs] = useState({
    merchant_id: merchant?.id,
    order_id: order_id,
    per_product: selectedOption,
    orderItemsAry: [],
  });

  // Populate `orderItemsAry` with item names
  useEffect(() => {
    if (orderProduct?.order_items) {
      setInputs((prev) => ({
        ...prev,
        orderItemsAry: orderProduct.order_items.map((item) => item.name),
      }));
    }
  }, [orderProduct]);

  const handleSubmit = () => {
    console.log("Submitting inputs:", inputs); // Debug log
    setLoading(true);
    postRequest(`/merchant/order/refund`, inputs)
      .then((res) => {
        Swal.fire({ icon: "success", text: res?.data?.message });
        setModals("");
      })
      .catch((error) => {
        Swal.fire({ icon: "error", text: error.message });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCheckboxChange = (product) => {
    if (checkedProducts.some((p) => p.id === product.order_item_id)) {
      setCheckedProducts((prev) =>
        prev.filter((p) => p.id !== product.order_item_id)
      );
    } else {
      setCheckedProducts((prev) => [
        ...prev,
        { id: product.order_item_id, qty: 1 }, // Default quantity for new product
      ]);
    }
  };

  const handleQuantityChange = (productQuantity, productId, qty) => {
    if (qty > 0 && qty <= productQuantity) {
      setCheckedProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? { ...product, qty: qty } : product
        )
      );
    }
  };

  // Initialize filteredProducts
  const filteredProducts =
    selectedOption === "by_product" && orderProduct?.order_items
      ? orderProduct.order_items
      : []; // Default to an empty array

  return (
    <Modal
      modalId={model_ids.refunded}
      heading="Refund"
      isOpen={modals === model_ids.refunded}
      onClose={() => {
        setModals(null);
        // setOrderProduct(null);
        setSelectedOption("full_order");
        setCheckedProducts([]); // Clear checked products on close
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
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
          {selectedOption === "by_product" && (
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
    </Modal>
  );
}
