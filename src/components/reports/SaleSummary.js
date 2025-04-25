"use client";

import Modal from "@/components/modal";
import { useContext, useEffect, useState } from "react";
import { getRequest } from "@/utils/apiFunctions";
import { GlobalContext } from "@/context";
import { report_type_modals } from "@/utils/constants";
import moment from "moment";

export default function SaleSummary(props) {
  const { user, merchant } = useContext(GlobalContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { setModals, modals, dateTo, dateFrom } = props;

  const getSummaryData = () => {
    setLoading(true);
    getRequest(
      `/merchant/${merchant?.id}/get_dashboard_sales?dateFrom=${dateFrom}&dateTo=${dateTo}`
    )
      .then((res) => {
        setData(res.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (dateTo && dateFrom) {
      getSummaryData();
    }
  }, [dateTo, dateFrom]);

  return (
    <Modal
      modalId={report_type_modals.saleSummary}
      heading="Sale Summary"
      isOpen={modals === report_type_modals.saleSummary}
      onClose={() => {
        setModals(null);
      }}
    >
      <div className="w-[300px] text-black p-2 bg-white">
        <div className="flex flex-col items-center text-[12px] border border-black">
          <div className="w-[100%] text-center text-[22px] font-bold leading-[30px] my-[20px]">
            {merchant?.name}
          </div>

          <div className="px-[10px] w-[100%] text-center  flex justify-between">
            <div class="font-bold">Date From</div>
            <div>{moment(dateFrom).format("DD-MMMM-YYYY")}</div>
            <div>{moment(dateFrom).format("LT")}</div>
          </div>

          <div className="px-[10px] w-[100%] text-center flex justify-between mb-[20px]">
            <div class="font-bold">Date To</div>
            <div>{moment(dateTo).format("DD-MMMM-YYYY")}</div>
            <div>{moment(dateTo).format("LT")}</div>
          </div>

          <div className="p-[10px] border-t w-[100%] border-[black] text-center text-[18px] font-[600]">
            Sales Summary
          </div>
          <div className="p-[10px] border-t border-b w-[100%] border-[black] text-center text-[18px] font-[500]">
            <div className="w-[100%] text-center flex justify-between items-center text-[14px]">
              <div>Total Net Sales</div>
              <div>
                {merchant?.currency?.symbol ?? <>&euro;</>}
                {data?.net_sale?.toFixed(2) ?? 0}
              </div>
            </div>
            {/* <div className="w-[100%] text-center flex justify-between items-center text-[14px]">
              <div>Tax</div>
              <div>{merchant?.currency?.symbol ?? <>&euro;</>}999</div>
            </div> */}
          </div>
          <div className="p-[10px] w-[100%] text-center flex justify-between items-center text-[14px] font-bold">
            <div>Total Sales</div>
            <div>
              {merchant?.currency?.symbol ?? <>&euro;</>}
              {data?.net_sale?.toFixed(2) ?? 0}
            </div>
          </div>

          {/*  */}
          <div className="p-[10px] border-t w-[100%] border-[black] text-center text-[18px] font-[600]">
            Payment Types
          </div>
          <div className="p-[10px] border-t border-b w-[100%] border-[black] text-center text-[18px] font-[500]">
            <div className="w-[100%] text-center flex justify-between items-center text-[14px]">
              <div>Card</div>
              <div>
                {merchant?.currency?.symbol ?? <>&euro;</>}
                {data?.card?.toFixed(2) ?? 0}
              </div>
            </div>
            <div className="w-[100%] text-center flex justify-between items-center text-[14px]">
              <div>Cash</div>
              <div>
                {merchant?.currency?.symbol ?? <>&euro;</>}
                {data?.cash?.toFixed(2) ?? 0}
              </div>
            </div>
            <div className="w-[100%] text-center flex justify-between items-center text-[14px]">
              <div>Other</div>
              <div>
                {merchant?.currency?.symbol ?? <>&euro;</>}
                {data?.other?.toFixed(2) ?? 0}
              </div>
            </div>
          </div>
          <div className="p-[10px] w-[100%] text-center flex justify-between items-center text-[14px] font-bold">
            <div>Total Payments</div>
            <div>
              {merchant?.currency?.symbol ?? <>&euro;</>}
              {data?.net_sale?.toFixed(2) ?? 0}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
