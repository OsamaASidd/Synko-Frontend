"use client";

import Modal from "@/components/modal";
import moment from "moment";

export default function Activity({ modelIsOpen2, setIsModalOpen2, data }) {
  const { inventories } = data;
  return (
    <>
      <Modal
        isOpen={modelIsOpen2}
        heading={"Activity"}
        onClose={() => {
          setIsModalOpen2(false);
        }}
        type={true}
      >
        <div className="p-[10px]">
          <div className="relative overflow-x-auto min-h-screen h-full overflow-y-hidden">
            <table className="w-full border text-left">
              <thead>
                <tr className="bg-[#055938] text-[#ffffff]">
                  <th className="px-7 py-3 text-[18px] font-medium">Date</th>
                  <th className="px-7 py-3 text-[18px] font-medium">
                    Stock Action
                  </th>
                  <th className="px-7 py-3 text-[18px] font-medium">Stock</th>
                  <th className="px-7 py-3 text-[18px] font-medium">Price</th>
                  <th className="px-7 py-3 text-[18px] font-medium">Vendor</th>
                  <th className="px-7 py-3 text-[18px] font-medium">Unit</th>
                  <th className="px-7 py-3 text-[18px] font-medium">
                    Stock Available
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventories && inventories.length > 0 ? (
                  <>
                    {inventories?.map((item) => (
                      <tr
                        key={item?.id}
                        className="border-b bg-white text-[14px]"
                      >
                        <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                          {moment(item?.created_at).format("DD-MMMM-YYYY")}
                        </td>
                        <td className="px-7 py-2 lg:py-2 whitespace-nowrap capitalize">
                          Stock {item?.stock_action}
                        </td>
                        <td className="px-7 py-2 lg:py-2 whitespace-nowrap capitalize">
                          {item?.stock_action == "received" ? (
                            <>
                              <span className="text-[#055938]">
                                +{item?.stock}
                              </span>
                            </>
                          ) : item?.stock_action == "sold" ? (
                            <>
                              <span className="text-[#EE3050]">
                                -{item?.stock}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-[#13AAE0]">
                                -{item?.stock}
                              </span>
                            </>
                          )}
                        </td>
                        <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                          {item?.price ?? "-"}
                        </td>
                        <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                          {item?.vendor?.name ?? "-"}
                        </td>
                        <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                          {data?.unit?.code == ""
                            ? "Per " + data?.unit?.name
                            : data?.unit?.code}
                        </td>
                        <td className="px-7 py-2 lg:py-2 whitespace-nowrap">
                          {item?.current_quantity ?? 0}
                        </td>
                      </tr>
                    ))}
                  </>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </>
  );
}
