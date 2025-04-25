"use client";

import {
  order_item_status,
  order_type_text,
  paid_by,
  paid_by_text,
  paid_status,
} from "@/utils/constants";
import {
  calcAmount,
  calculatePriceWithTax,
  calculateTotalCost,
  calculateTotalCostBySplitItems,
  formatNumber,
  getTotalProductCost,
} from "@/utils/helper";
import moment from "moment";
import { forwardRef, useContext } from "react";

const PrintKOT = forwardRef((props, ref) => {
  const { data } = props;
  const order = data?.order;
  const merchant = order?.merchant;
  const net_amount = +order?.net_amount || 0;
  const gross_total = +order?.gross_total || 0;
  // const tax = order?.tax?.tax ?? 0;
  const { discountAmount } = calcAmount(
    data?.order?.discount,
    null,
    gross_total
  );

  const { tax } = calculatePriceWithTax(order, gross_total, discountAmount);

  // let discountValue = order?.discount != null ? order?.discount?.discount : 0;
  let discountValue = discountAmount ? discountAmount : 0;
  let discountType =
    order?.discount != null
      ? order?.discount?.discount_type == "by_percentage"
        ? `${order?.discount?.discount} %`
        : `${order?.discount?.discount}Amount`
      : 0;
  let discountName =
    order?.discount != null ? order?.discount?.discount_name : "";

  const splitItems = order?.order_splits;
  const handleSplitItemsLine = (splitItem) => {
    const totalSplitCost = calculateTotalCostBySplitItems(
      splitItem?.order_splits
    );

    const { discountedCost } = calcAmount(data?.discount, null, totalSplitCost);

    const { totalWithTax, totalCost } = calculatePriceWithTax(
      merchant,
      discountedCost
    );
    // const { totalWithTax, totalCost } = calculatePriceWithTax(
    //   merchant,
    //   totalSplitCost
    // );
    // const { discountedCost } = calcAmount(
    //   data?.discount,
    //   null,
    //   tax ? totalWithTax : totalCost
    // );
    return tax ? totalWithTax : discountedCost;
  };

  let categoryCount = 0;
  let tempCategory = "";

  return (
    <>
      <div ref={ref} className="w-[250px] text-black p-4 bg-white">
        <div className="flex flex-col items-center text-[12px] border border-black page-break px-2 py-4">
          {/* Header */}
          <div className="w-full text-center text-[20px] font-bold mb-2">
            KITCHEN RECEIPT
          </div>
          <div className="h-[1px] w-full bg-black my-2"></div>

          {/* Dates and Times */}
          <div className="w-full flex justify-between text-[12px] mb-2">
            <span>Print Date:</span>
            <span>{moment().format("DD-MMM-YYYY")}</span>
            <span>{moment().format("LT")}</span>
          </div>
          <div className="w-full flex justify-between text-[12px] mb-2">
            <span>Order Date:</span>
            <span>{moment(order?.created_at).format("DD-MMM-YYYY")}</span>
            <span>{moment(order?.created_at).format("LT")}</span>
          </div>

          <div className="h-[1px] w-full bg-black my-2"></div>

          {/* Order Info */}
          <div className="w-full text-center text-[16px] font-bold mb-2">
            {order_type_text[order?.order_type]}
          </div>
          <div className="w-full flex justify-between text-[12px] mb-1">
            <span>Order No:</span>
            <span>{order?.id}</span>
          </div>
          {order?.table && (
            <div className="w-full flex justify-between text-[12px] mb-1">
              <span>Table #:</span>
              <span>{order?.table?.number}</span>
            </div>
          )}
          {data?.order?.merchant_partners_id?.name && (
            <div className="w-full flex justify-between text-[12px] mb-1">
              <span>Partner:</span>
              <span>{data?.order?.merchant_partners_id?.name}</span>
            </div>
          )}

          <div className="h-[1px] w-full bg-black my-2"></div>

          {/* Order Items */}
          <div className="w-full mt-[5px]">
            {order?.order_items && order?.order_items.length > 0 ? (
              order?.order_items?.map((item, index) => {
                if (
                  item?.status == order_item_status.canceled ||
                  item?.status == order_item_status.wasted
                ) {
                  return <></>;
                }

                if (
                  tempCategory != item?.category?.name &&
                  tempCategory != item?.menu_item?.category?.name
                ) {
                  categoryCount = 1;
                  tempCategory =
                    item?.category?.name || item?.menu_item?.category?.name;
                } else {
                  categoryCount++;
                }

                return (
                  <div key={index} className="mb-[15px]">
                    <h4 className="font-bold text-[17px] underline">
                      {categoryCount == 1
                        ? item?.category?.name ||
                          item?.menu_item?.category?.name
                        : ""}
                    </h4>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[16px]">
                        {item?.quantity - (item?.removeItems ?? 0)} x{" "}
                        {item?.name ?? item?.menu_item?.name}
                      </h4>
                      <h6 className="text-[13px] font-semibold">
                        {merchant?.currency?.symbol ?? <>&euro;</>}
                        {getTotalProductCost(item)}
                      </h6>
                    </div>
                    {item && item?.modifications
                      ? item.modifications.map((mod, indexx) => (
                          <>
                            <div
                              key={indexx}
                              className="flex items-start justify-between"
                            >
                              <h4 className="text-[14px]">
                                {mod?.modificationOption?.modification_category
                                  ?.is_excluded == 0
                                  ? "+ "
                                  : "- "}
                                {mod.name ?? mod?.modificationOption?.name}
                              </h4>
                              {mod?.ModificationOptionPrice?.extra_cost > 0 ? (
                                <h6 className="text-[13px]">
                                  {merchant?.currency?.symbol ?? <>&euro;</>}
                                  {formatNumber(
                                    mod?.ModificationOptionPrice?.extra_cost
                                  )}
                                </h6>
                              ) : null}
                            </div>
                          </>
                        ))
                      : null}
                    {item?.special_instructions ? (
                      <div className="mt-[5px] text-[15px]">
                        <spam className="font-semibold">Note:</spam>{" "}
                        {item?.special_instructions}
                      </div>
                    ) : null}
                    {item?.status == order_item_status.refunded ? (
                      <h4 className="text-[14px]">{"(Refunded)"}</h4>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <p>No Order Item Found!</p>
            )}
          </div>
          {/* End */}
        </div>
      </div>
    </>
  );
});
PrintKOT.displayName = "PrintKOT";
export default PrintKOT;
