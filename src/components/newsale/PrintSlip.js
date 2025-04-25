"use client";
import { storageUrl } from "@/utils/api";
import {
  order_item_status,
  order_type,
  order_type_text,
  paid_by,
  paid_by_text,
  paid_status,
} from "@/utils/constants";
import {
  calcAmount,
  calculatePriceWithTax,
  calculateTotalCostBySplitItems,
  formatNumber,
  getTotalProductCost,
} from "../../utils/helper";
import moment from "moment";
import { forwardRef, useContext } from "react";

const PrintSlip = forwardRef((props, ref) => {
  const { data } = props;
  const order = data?.order;
  const merchant = order?.merchant;
  const net_amount = +order?.net_amount || 0;
  const gross_total = +order?.gross_total || 0;
  const deliveryCharges = +order?.deliveryCharges?.charges || 0;
  const service_charges = +order?.service_charges || 0;
  // const tax = order?.tax?.tax ?? 0;
  const { discountAmount } = calcAmount(
    data?.order?.discount,
    null,
    gross_total
  );

  const { tax } = calculatePriceWithTax(
    order,
    gross_total,
    discountAmount,
    null,
    service_charges,
    deliveryCharges
  );

  // let discountValue = order?.discount != null ? order?.discount?.discount : 0;
  let discountValue = discountAmount ? discountAmount : 0;
  let discountType =
    order?.discount != null
      ? order?.discount?.discount_type == "by_percentage"
        ? `${order?.discount?.discount}%`
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
    <div ref={ref} className="w-[250px] text-black p-2 bg-white">
      <div className="flex flex-col items-center text-[12px] p-2 w-full">
        {/* Order and Merchant Details */}
        <div className="w-full border-y border-black py-[8px] text-center leading-[20px]">
          <h2 className="text-[18px] font-bold">Order {order?.id}</h2>
          <h5 className="text-[15px]">{merchant?.name}</h5>
          <h6 className="text-[12px]">
            Print time {moment().format("LT DD-MMM-YYYY")}
          </h6>
        </div>
        {/* End */}

        {/* Order Type & Payment Status */}
        <div className="w-full border-b border-black py-[20px] text-center leading-[20px]">
          <h2 className="text-[18px] font-bold">
            {order_type_text[order?.order_type]}{" "}
            {order?.table?.number ? "#" + order?.table?.number : null}
          </h2>
          <h2 className="text-[18px] font-bold uppercase">
            {order?.paid_status == paid_status.unpaid ? "UNPAID" : "PAID"}
          </h2>
        </div>
        {/* End */}

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
                      ? item?.category?.name || item?.menu_item?.category?.name
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

        {/* Order Payment */}
        <div className="w-full mt-[20px]">
          <div className="flex items-center justify-between">
            <h4 className="text-[14px]">Gross</h4>
            <h6 className="text-[14px]">
              {merchant?.currency?.symbol ?? <>&euro;</>}
              {formatNumber(gross_total)}
            </h6>
          </div>

          {order?.discount != null ? (
            <>
              <div className="flex items-center justify-between">
                <h4 className="text-[14px]">Discount {discountType}</h4>
                <h6 className="text-[14px]">
                  {discountType == "%" ? (
                    `${discountValue}${discountType}`
                  ) : (
                    <>
                      {merchant?.currency?.symbol ?? <>&euro;</>}
                      {formatNumber(discountValue)}
                    </>
                  )}
                </h6>
              </div>
            </>
          ) : (
            <></>
          )}

          {order?.service_charges > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h4 className="text-[14px]">Service Charges</h4>
                <h6 className="text-[14px]">
                  {merchant?.currency?.symbol ?? <>&euro;</>}
                  {formatNumber(order?.service_charges || 0)}
                </h6>
              </div>
            </>
          ) : (
            <></>
          )}

          {deliveryCharges ? (
            <>
              <div className="flex items-center justify-between">
                <h4 className="text-[14px]">Delivery Charges</h4>
                <h6 className="text-[14px]">
                  {merchant?.currency?.symbol ?? <>&euro;</>}
                  {formatNumber(deliveryCharges || 0)}
                </h6>
              </div>
            </>
          ) : (
            <></>
          )}

          {order?.tax?.tax ? (
            <>
              <div className="flex items-center justify-between">
                <h4 className="text-[14px]">Tax {order?.tax?.tax ?? 0}%</h4>
                <h6 className="text-[14px]">
                  {merchant?.currency?.symbol ?? <>&euro;</>}
                  {tax.toFixed(2)}
                </h6>
              </div>
            </>
          ) : (
            <></>
          )}

          {order?.paid_by == paid_by.none &&
          order?.paid_status == paid_status.unpaid &&
          merchant?.is_tax_separate == true ? (
            <>
              <div className="flex items-center justify-between">
                <h4 className="text-[14px]">Cash Net</h4>
                <h6 className="text-[14px]">
                  {merchant?.currency?.symbol ?? <>&euro;</>}
                  {formatNumber(
                    calculatePriceWithTax(merchant, net_amount, 0, {
                      checkout: true,
                      paymentMethod: "cash",
                    }).totalWithTax
                  )}
                </h6>
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-[14px]">Card Net</h4>
                <h6 className="text-[14px]">
                  {merchant?.currency?.symbol ?? <>&euro;</>}
                  {formatNumber(
                    calculatePriceWithTax(merchant, net_amount, 0, {
                      checkout: true,
                      paymentMethod: "card",
                    }).totalWithTax
                  )}
                </h6>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h4 className="text-[14px]">Total</h4>
                <h6 className="text-[14px]">
                  {merchant?.currency?.symbol ?? <>&euro;</>}
                  {formatNumber(net_amount)}
                </h6>
              </div>
            </>
          )}
        </div>
        {/* End */}

        {/* Payment */}
        <div className="w-full mt-[5px] py-[5px] border-y border-black">
          {splitItems && splitItems?.length > 0 ? (
            <>
              <h4 className="text-[14px]">Payment</h4>
              {splitItems.map((item, index) => {
                const split_by = +item?.split_by;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <h4 className="text-[14px] capitalize">
                      {item?.payment_method}{" "}
                      {item?.split_status == "by_divide"
                        ? `1/${split_by}`
                        : null}
                    </h4>
                    <h6 className="text-[14px]">
                      {merchant?.currency?.symbol ?? <>&euro;</>}
                      {split_by > 0
                        ? (net_amount / split_by).toFixed(2)
                        : handleSplitItemsLine(item)}
                    </h6>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h4 className="text-[14px]">Payment</h4>
                <h6 className="text-[14px]">
                  {splitItems && splitItems?.length > 0
                    ? "Splitted"
                    : paid_by_text[order?.paid_by]}
                </h6>
              </div>
            </>
          )}
          {order?.paid_by == paid_by.cash &&
          order?.amount_received > 0 &&
          order?.change > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h4 className="text-[14px]">Tendered Total</h4>
                <h6 className="text-[14px]">
                  {merchant?.currency?.symbol ?? <>&euro;</>}
                  {order?.amount_received}
                </h6>
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-[14px]">Change</h4>
                <h6 className="text-[14px]">
                  {merchant?.currency?.symbol ?? <>&euro;</>}
                  {order?.change}
                </h6>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
        {/* End */}

        {/* Customer */}
        {order?.customer != null ? (
          <>
            <div className="w-full mt-[10px]">
              <div>
                <h4 className="text-[14px]">Customer Info</h4>
                {order?.customer?.fullname && (
                  <h4 className="text-[16px] mb-[15px]">
                    {order?.customer?.fullname}
                  </h4>
                )}

                {order?.order_type == order_type.delivery ? (
                  <>
                    {order?.customer?.home_apartment_address && (
                      <>
                        <h4 className="text-[16px] mb-[5px]">
                          {order?.customer?.home_apartment_address}
                        </h4>
                      </>
                    )}

                    {order?.customer?.address && (
                      <>
                        <h4 className="text-[16px] mb-[15px]">
                          {order?.customer?.address}
                        </h4>
                      </>
                    )}
                  </>
                ) : (
                  <></>
                )}

                <h4 className="text-[14px]">Customer Phone</h4>
                {order?.customer?.fullname && (
                  <h4 className="text-[16px] mb-[15px]">
                    {order?.customer?.phone_code}
                    {order?.customer?.phone}
                  </h4>
                )}
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
        {/* End */}

        {/* Final Line */}
        <div className="w-full border-t-[3px] border-dashed border-black mb-[10px]"></div>
        {/* End */}

        {/* Synko Logo */}
        <div className="flex items-center w-full justify-between mb-[10px]">
          <h4 className="text-end">Powered By</h4>
          <img className="w-[100px]" src="/images/logo_black.png" />
        </div>
        {/* End */}
      </div>
    </div>
  );

  return (
    <>
      <div ref={ref} className="w-[250px] text-black p-2 bg-white">
        <div className="flex flex-col items-center text-[12px] border border-black px-[5px]">
          <div className="w-[100%] text-center text-[20px] font-bold">
            <div className="flex justify-center items-center mt-2">
              <img
                className="w-[80px]"
                src={
                  merchant?.image_src != null
                    ? `${storageUrl}/merchants/${merchant?.image_src}`
                    : "/images/Vector.png"
                }
                alt={merchant?.name}
              />
            </div>
            {/* {merchant?.name} */}
          </div>

          <div className="font-bold">{merchant?.name}</div>

          <div className="w-[100%] text-center text-[14px] ">
            {merchant?.phone_no ?? ""}
          </div>

          <div className="w-[100%] text-center ">{merchant?.address ?? ""}</div>

          <div className="w-[100%] text-center  text-[20px] font-bold">
            SALE RECEIPT
          </div>

          <div className="w-[100%] text-center  flex justify-between">
            <div>Print Date</div>

            <div>{moment().format("DD-MMM-YYYY")}</div>

            <div>{moment().format("LT")}</div>
          </div>

          <div className="w-[100%] text-center  flex justify-between">
            <div>Order Date</div>

            <div>{moment(order?.created_at).format("DD-MMM-YYYY")}</div>

            <div>{moment(order?.created_at).format("LT")}</div>
          </div>

          {order?.customer != null ? (
            <>
              <div className="w-[100%] text-center  text-[20px] font-bold">
                Customer Info
              </div>

              {order?.customer?.fullname && (
                <div className="w-[100%] text-center  flex justify-between">
                  <div>Full Name:</div>
                  <div>{order?.customer?.fullname} </div>
                </div>
              )}

              {order?.merchant_partners?.name && (
                <div className="w-[100%] text-center  flex justify-between">
                  <div>Payty Name:</div>
                  <div>{order?.merchant_partners?.name} </div>
                </div>
              )}

              {order?.party_order_id && (
                <div className="w-[100%] text-center  flex justify-between">
                  <div>Order Id:</div>
                  <div>{order?.party_order_id} </div>
                </div>
              )}

              {order?.customer?.phone && (
                <div className="w-[100%] text-center  flex justify-between">
                  <div>Phone:</div>
                  <div>{order?.customer?.phone} </div>
                </div>
              )}

              {order?.customer?.email && (
                <div className="w-[100%] text-center  flex justify-between">
                  <div>Email:</div>
                  <div>{order?.customer?.email} </div>
                </div>
              )}

              {order?.customer?.address && (
                <div className="w-[100%] text-center  flex justify-between">
                  <div style={{ width: "250px", textAlign: "left" }}>
                    Delivery Address:
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {order?.customer?.address}{" "}
                  </div>
                </div>
              )}

              {order?.customer?.home_apartment_address && (
                <div className="w-[100%] text-center  flex justify-between">
                  <div style={{ width: "100px", textAlign: "left" }}>
                    Home Address:
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {order?.customer?.home_apartment_address}
                  </div>
                </div>
              )}
            </>
          ) : (
            <></>
          )}

          <div className="w-[100%] text-center text-[20px] font-bold">
            {order_type_text[order?.order_type]}
          </div>

          <div className="w-[100%] text-center  flex justify-between capitalize">
            <div>Payment Method</div>
            <div>
              {splitItems && splitItems?.length > 0
                ? "Splitted"
                : paid_by_text[order?.paid_by]}
            </div>
          </div>

          {order?.order_type == order_type.delivery ? (
            <div className="w-[100%] text-center  flex justify-between capitalize">
              <div>Payment Status</div>
              {order?.paid_status == paid_status.unpaid ? "Un-Paid" : "Paid"}
            </div>
          ) : null}

          {order?.order_type !== order_type.delivery ? (
            <div className="w-[100%] text-center  flex justify-between">
              <div className="w-[60px] text-start ">Order No</div>

              <div>{order?.id}</div>
            </div>
          ) : null}

          {order?.table && (
            <div className="w-[100%] text-center  flex justify-between">
              <div className="w-[60px] text-start ">Table #</div>

              <div>{order?.table?.number}</div>

              <div></div>
            </div>
          )}

          {data?.order?.merchant_partners_id?.name && (
            <div className="w-[100%] text-center  flex justify-between">
              <div className="w-[60px] text-start ">Selected Partner </div>

              <div>{data?.order?.merchant_partners_id?.name}</div>

              <div></div>
            </div>
          )}

          <table className="w-[100%]">
            <thead className="w-[100%]">
              <tr className="border-b border-black w-[100%]">
                <th className="w-[25%]">Qty</th>

                <th className="w-[25%]">Description</th>

                <th className="w-[25%]">Rate</th>

                <th className="w-[25%]">Amount</th>
              </tr>
            </thead>

            <tbody>
              {order?.order_items && order?.order_items.length > 0 ? (
                <>
                  {order?.order_items?.map((item, index) => {
                    if (
                      item?.status == order_item_status.canceled ||
                      item?.status == order_item_status.wasted
                    ) {
                      return <></>;
                    }
                    return (
                      <tr key={index}>
                        <td className="w-[25%] text-center">
                          {item?.quantity - (item?.removeItems ?? 0)}
                        </td>

                        <td className="w-[25%] text-center">
                          {item?.name ?? item?.menu_item?.name}

                          {item && item?.modifications ? (
                            <>
                              {item.modifications.map((mod, indexx) => (
                                <span key={indexx}>
                                  {mod.name ?? mod?.modificationOption?.name}
                                </span>
                              ))}
                            </>
                          ) : (
                            <></>
                          )}
                        </td>

                        <td className="w-[25%] text-center">
                          {merchant?.currency?.symbol ?? <>&euro;</>}
                          {formatNumber(item?.MenuItemPrice?.price)}
                        </td>

                        <td className="w-[25%] text-center">
                          {merchant?.currency?.symbol ?? <>&euro;</>}
                          {getTotalProductCost(item)}
                        </td>
                      </tr>
                    );
                  })}
                </>
              ) : (
                <p className="text-[white]">No Order Item Found!</p>
              )}
            </tbody>
          </table>

          <div className="w-[100%] text-center  flex justify-between">
            <div>Gross</div>

            <div>
              {merchant?.currency?.symbol ?? <>&euro;</>}
              {formatNumber(gross_total)}
            </div>
          </div>

          {order?.discount != null ? (
            <>
              <div className="w-[100%] text-center  flex justify-between">
                <div>Discount({discountType})</div>
                <div>{discountName}</div>
                <div>
                  {/* {discountType=="%"?`${discountType}${discountValue}`} :`${discountType}${discountValue}` */}
                  {discountType == "%" ? (
                    `${discountValue}${discountType}`
                  ) : (
                    <>
                      {merchant?.currency?.symbol ?? <>&euro;</>}
                      {formatNumber(discountValue)}
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <></>
          )}

          {data?.discount && (
            <div className="w-[100%] text-center  flex justify-between">
              <div>
                DISCOUNT{" "}
                {data?.discount?.discount_type == "by_percentage"
                  ? "(" + data?.discount?.discount + "%)" || ""
                  : ""}
                :
              </div>

              <div>
                -{merchant?.currency?.symbol ?? <>&euro;</>}
                {formatNumber(discountAmount)}
              </div>
            </div>
          )}

          {order?.service_charges ? (
            <div className="w-[100%] text-center  flex justify-between">
              <div>Service Charges:</div>

              <div>
                {merchant?.currency?.symbol ?? <>&euro;</>}
                {formatNumber(order?.service_charges || 0)}
              </div>
            </div>
          ) : (
            ""
          )}

          {deliveryCharges ? (
            <div className="w-[100%] text-center  flex justify-between">
              <div>Delivery Charges:</div>

              <div>
                {merchant?.currency?.symbol ?? <>&euro;</>}
                {formatNumber(deliveryCharges || 0)}
              </div>
            </div>
          ) : (
            ""
          )}

          {order?.tax?.tax ? (
            <div className="w-[100%] text-center  flex justify-between">
              <div>Tax ({order?.tax?.tax ?? 0}%)</div>

              <div>
                {merchant?.currency?.symbol ?? <>&euro;</>}
                {tax.toFixed(2)}
                {/* {((tax / 100) * (gross_total - discountAmount)).toFixed(2)} */}
              </div>
            </div>
          ) : (
            ""
          )}
          {/* {order?.deliveryCharges != null ? (
            <>
              <div className="w-[100%] text-center  flex justify-between">
                <div>Delivery Charges</div>
                <div>
                  {merchant?.currency?.symbol ?? <>&euro;</>}
                  {order?.deliveryCharges?.charges}
                </div>
              </div>
            </>
          ) : (
            <></>
          )} */}

          {/* payment process */}

          {/* {
            order?.order_splits.length != 0 ? <>
              <div className="w-[100%] font-semibold text-center  flex justify-between">
                <div>Payment Mode</div>

                <div>Split Payment</div>
              </div>
              <div className="w-[100%] font-semibold text-center  flex justify-between">
                <div>Split By</div>

                <div>{splitBy}</div>
              </div>


              <div className="w-[100%] font-semibold text-center  flex justify-between">
                <div>Payment Method</div>

                <div>{payment_method}</div>
              </div>
            </>
              :
              <>
                <div className="w-[100%] font-semibold text-center  flex justify-between">
                  <div>Payment Mode</div>

                  <div>{paid_by_text[order?.paid_by]}</div>
                </div>
              </>
          } */}

          {order?.paid_by == paid_by.none &&
          order?.paid_status == paid_status.unpaid &&
          merchant?.is_tax_separate == true ? (
            <>
              <div className="w-[100%] text-center  flex justify-between text-[14px] font-bold">
                <div>CASH NET</div>

                <div>
                  {merchant?.currency?.symbol ?? <>&euro;</>}
                  {formatNumber(
                    calculatePriceWithTax(merchant, net_amount, 0, {
                      checkout: true,
                      paymentMethod: "cash",
                    }).totalWithTax
                  )}
                </div>
              </div>
              <div className="w-[100%] text-center  flex justify-between text-[14px] font-bold">
                <div>CARD NET</div>

                <div>
                  {merchant?.currency?.symbol ?? <>&euro;</>}
                  {formatNumber(
                    calculatePriceWithTax(merchant, net_amount, 0, {
                      checkout: true,
                      paymentMethod: "card",
                    }).totalWithTax
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-[100%] text-center  flex justify-between text-[20px] font-bold">
                <div>NET BILL</div>

                <div>
                  {merchant?.currency?.symbol ?? <>&euro;</>}
                  {formatNumber(net_amount)}
                </div>
              </div>
            </>
          )}

          {splitItems && splitItems?.length > 0 ? (
            <>
              {splitItems.map((item, index) => {
                const split_by = +item?.split_by;
                return (
                  <div
                    key={index}
                    className="w-[100%] font-semibold text-center flex justify-between"
                  >
                    <div className="capitalize">
                      {item?.payment_method}{" "}
                      {item?.split_status == "by_divide"
                        ? `1/${split_by}`
                        : null}
                    </div>
                    <div>
                      {merchant?.currency?.symbol ?? <>&euro;</>}
                      {split_by > 0
                        ? (net_amount / split_by).toFixed(2)
                        : handleSplitItemsLine(item)}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {/* <div className="flex justify-between capitalize">
                <div>Payment Method</div>
                {order?.paid_by == "1" ? "Cash" : null}

                {order?.paid_by == "2" ? "Card" : null}

                {order?.paid_by == "3" ? "Credits" : null}

                {order?.paid_by == "4" ? "Foc" : null}
                {order?.paid_by == "5" ? "Uber" : null}
                {order?.paid_by == "7" ? "Door_dash" : null}
              </div> */}

              {/* {order?.paid_by == paid_by.none &&
              order?.paid_status == paid_status.unpaid ? null : (
                <div className="w-[100%] text-center  flex justify-between capitalize">
                  <div>Payment Method</div>
                  {order &&
                    (order?.paid_by == paid_by.cash
                      ? "Cash"
                      : order?.paid_by == paid_by.card
                      ? "Card"
                      : order?.paid_by == paid_by.credits
                      ? "Credits"
                      : order?.paid_by == "4"
                      ? "Foc"
                      : order?.paid_by == "5"
                      ? "Uber"
                      : order?.paid_by == "7"
                      ? "Door_dash"
                      : null)}
                </div>
              )} */}

              {order?.paid_by == paid_by.cash && order?.amount_received > 0 ? (
                <>
                  <div className="w-[100%] text-center  flex justify-between capitalize">
                    <div>Tendered Total:</div>
                    <div>
                      {merchant?.currency?.symbol ?? <>&euro;</>}
                      {order?.amount_received}
                    </div>
                  </div>
                  <div className="w-[100%] text-center  flex justify-between capitalize">
                    <div>Change:</div>
                    <div>
                      {merchant?.currency?.symbol ?? <>&euro;</>}
                      {order?.change}
                    </div>
                  </div>
                </>
              ) : null}
            </>
          )}

          {order?.paid_by == paid_by.none &&
          order?.paid_status == paid_status.unpaid ? null : (
            <>
              <div className="w-[100%] text-center ">
                Thank you for your order!
              </div>
              <div className="w-[100%] text-center ">Do Come Again:)</div>
            </>
          )}
        </div>
      </div>
    </>
  );
});
PrintSlip.displayName = "PrintSlip";
export default PrintSlip;
