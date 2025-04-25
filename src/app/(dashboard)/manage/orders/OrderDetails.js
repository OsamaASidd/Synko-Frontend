"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  calculatePaymentMethodIfSplit,
  extractDateTimeInfo,
} from "@/utils/helper";
import {
  order_status_text,
  order_type_text,
  paid_by_text,
} from "@/utils/constants";
import { useReactToPrint } from "react-to-print";
import PrintSlip from "@/components/newsale/PrintSlip";
import PrintKOT from "@/components/newsale/PrintKOT";

const OrderDetails = ({ data }) => {
  const [printData, setPrintData] = useState(null);
  const [printKotData, setPrintKotData] = useState(null);

  // Destructure data
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
  } = data;

  let result = calculatePaymentMethodIfSplit([data]);
  let orderDate = extractDateTimeInfo(order_date);

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const componentKotRef = useRef();
  const handlePrintKot = useReactToPrint({
    content: () => componentKotRef.current,
  });

  // useEffect(() => {
  //   if (data) {
  //     handlePrintKot();
  //   }
  // }, [data]);

  useEffect(() => {
    if (data) {
      setPrintData(data);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      setPrintKotData(data);
    }
  }, [data]);

  return (
    <>
      <div className="bg-gray-100 p-[6px] sm:p-3 rounded-lg shadow-md text-[14px] sm:text-[16px]">
        {customer && (
          <>
            <h2 className="py-2 px-4 text-xl font-semibold mb-4 bg-[#055938] text-[#fff]">
              Customer Details
            </h2>
            <table className="mb-4 w-full border-collapse border border-gray-300">
              <tbody>
                <tr>
                  <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                    Name:
                  </th>
                  <td className="pl-2 sm:pl-4 border border-gray-300">
                    {customer?.fullname || "N/A"}
                  </td>
                </tr>
                <tr>
                  <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                    Email:
                  </th>
                  <td className="pl-2 sm:pl-4 border border-gray-300">
                    {customer?.email || "N/A"}
                  </td>
                </tr>
                <tr>
                  <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                    Phone:
                  </th>
                  <td className="pl-2 sm:pl-4 border border-gray-300">
                    {customer?.phone || "N/A"}
                  </td>
                </tr>
                <tr>
                  <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                    Address:
                  </th>
                  <td className="pl-2 sm:pl-4 border border-gray-300">
                    {customer?.address || "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
        <h2 className="py-2 px-4 text-xl font-semibold mb-4 bg-[#055938] text-[#fff]">
          Order Details
        </h2>
        <table className="mb-4 w-full border-collapse border border-gray-300">
          <tbody>
            <tr>
              <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                Order ID:
              </th>
              <td className="pl-2 sm:pl-4 border border-gray-300">{id}</td>
            </tr>
            <tr>
              <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                Order Date:
              </th>
              <td className="pl-2 sm:pl-4 border border-gray-300">
                {orderDate?.date +
                  "/" +
                  orderDate?.month +
                  "/" +
                  orderDate?.year +
                  " " +
                  orderDate?.hours +
                  ":" +
                  orderDate?.minutes +
                  " " +
                  orderDate?.ampm}
              </td>
            </tr>
            <tr>
              <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                Order Type:
              </th>
              <td className="pl-2 sm:pl-4 border border-gray-300">
                {order_type_text[data?.order_type]}
              </td>
            </tr>
            <tr>
              <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                Order Status:
              </th>
              <td className="pl-2 sm:pl-4 border border-gray-300">
                {order_status_text[data?.order_status]}
              </td>
            </tr>

            <tr>
              <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                Payment Type:
              </th>
              <td className="pl-2 sm:pl-4 border border-gray-300">
                {paid_by_text[data?.paid_by]}
              </td>
            </tr>

            <tr>
              <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                Gross Total:
              </th>
              <td className="pl-2 sm:pl-4 border border-gray-300">
                {data?.currency?.symbol}
                {gross_total}
              </td>
            </tr>

            <tr>
              <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                Discount(
                {discount?.discount_type == "by_percentage" ? "%" : "Amount"}):
              </th>
              <td className="pl-2 sm:pl-4 border border-gray-300">
                {discount != null
                  ? `${
                      discount?.discount_type == "by_percentage"
                        ? `${discount?.discount}%`
                        : `${data?.currency?.symbol}${discount?.discount}`
                    }`
                  : 0}
              </td>
            </tr>
            {deliveryCharges && (
              <tr>
                <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                  Delivery Charges:
                </th>
                <td className="pl-2 sm:pl-4 border border-gray-300">
                  {data?.deliveryCharges?.charges}
                </td>
              </tr>
            )}
            <tr>
              <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                Service Charges:
              </th>
              <td className="pl-2 sm:pl-4 border border-gray-300">
                {data?.service_charges}
              </td>
            </tr>
            <tr>
              <th className="  pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                Tax:
              </th>
              <td className=" pl-4 border border-gray-300">
                {data?.tax ? data?.tax?.tax + "%" : "0%"}
              </td>
            </tr>
            <tr>
              <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 text-left">
                Net Amount:
              </th>
              <td className="pl-2 sm:pl-4 border border-gray-300">
                {data?.currency?.symbol}
                {net_amount}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Order Items</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 bg-[#055938] text-[#fff]">
                  Name
                </th>
                <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 bg-[#055938] text-[#fff]">
                  Quantity
                </th>
                <th className="pl-2 sm:pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 bg-[#055938] text-[#fff]">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {order_items?.map((item) => (
                <tr key={item.id}>
                  <td className="pl-2 sm:pl-4 py-1 pr-2 sm:pr-4 border border-gray-300 line-clamp-2">
                    {item?.name}
                    {item?.status === 6 &&(
                      <p className="text-[12px] text-[red]">Refunded</p>
                    )}
                    
                  </td>
                  <td className="pl-2 sm:pl-4 py-1 pr-2 sm:pr-4 border border-gray-300">
                    {item?.quantity}
                  </td>
                  <td className="pl-2 sm:pl-4 py-1 pr-2 sm:pr-4 border border-gray-300">
                    {data?.currency?.symbol}
                    {item?.MenuItemPrice?.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.order_splits.length > 0 ? (
          <>
            {/* <div>
        <h3 className="text-lg font-semibold mb-2">Order Splits</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className=" pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 bg-[#055938] text-[#fff]">Method</th>
              <th className=" pl-4 py-2 pr-2 sm:pr-4 border border-gray-300 bg-[#055938] text-[#fff]">Amount</th>
            </tr>
          </thead>
          <tbody>
            
              <tr>
                <td className="py-2 pr-2 sm:pr-4 border border-gray-300">2</td>
                <td className="py-2 pr-2 sm:pr-4 border border-gray-300">3</td>
              </tr>
            
          </tbody>
        </table>
      </div> */}
          </>
        ) : (
          ""
        )}
      </div>
      <div className="flex gap-x-[10px] w-full mt-4">
        <button
          onClick={() => {
            handlePrintKot();
          }}
          className="px-4 py-3 w-[100%] lg:text-[16px] text-[12px] whitespace-nowrap border  bg-[#fff] text-[#8F8F8F] font-bold border-[#8F8F8F] rounded-md"
        >
          KOT
        </button>
        <button
          onClick={() => {
            handlePrint();
          }}
          className="px-4 py-3 w-[100%] lg:text-[16px] text-[12px] whitespace-nowrap border  bg-[#fff] text-[#8F8F8F] font-bold border-[#8F8F8F] rounded-md"
        >
          Receipt
        </button>
      </div>

      <div className="hidden">
        <PrintSlip data={{ order: printData }} ref={componentRef} />
        <PrintKOT data={{ order: printKotData }} ref={componentKotRef} />
      </div>
    </>
  );
};

export default OrderDetails;
