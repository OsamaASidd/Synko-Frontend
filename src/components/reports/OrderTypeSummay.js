"use client";

import Modal from "@/components/modal";
import { useContext, useEffect, useState } from "react";
import { getRequest } from "@/utils/apiFunctions";
import { GlobalContext } from "@/context";
import { report_type_modals } from "@/utils/constants";
import moment from "moment";

export default function OrderTypeSummary(props) {
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
      modalId={report_type_modals.orderTypeSummary}
      heading="Order Type Summary Financial"
      isOpen={modals === report_type_modals.orderTypeSummary}
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
            DINE IN
          </div>
          <div className="p-[10px] border-t border-b w-[100%] border-[black] text-center text-[18px] font-[500]">
            <div className="w-[100%] text-center flex justify-between items-center text-[14px] mb-[5px]">
              <div>No of Orders</div>
              <div>{data?.total_no_dine_in ?? 0}</div>
            </div>

            <div className="w-[100%] text-center flex justify-between items-center text-[14px]">
              <div>Gross</div>
              <div>
                {merchant?.currency?.symbol ?? <>&euro;</>}
                {data?.dine_in?.toFixed(2) ?? 0}
              </div>
            </div>
            <div className="w-[100%] text-center flex justify-between items-center text-[14px]">
              <div>Tax</div>
              <div>{merchant?.currency?.symbol ?? <>&euro;</>}0</div>
            </div>
            <div className="w-[100%] text-center flex justify-between items-center text-[14px]">
              <div>Total</div>
              <div>
                {merchant?.currency?.symbol ?? <>&euro;</>}
                {data?.dine_in?.toFixed(2) ?? 0}
              </div>
            </div>

            <div className="w-[100%] text-center flex justify-between items-center text-[14px] font-bold">
              <div>Net Amount</div>
              <div>
                {merchant?.currency?.symbol ?? <>&euro;</>}
                {data?.dine_in?.toFixed(2) ?? 0}
              </div>
            </div>
          </div>

          <div className="p-[10px] border-t w-[100%] border-[black] text-center text-[18px] font-[600]">
            TAKEAWAY
          </div>
          <div className="p-[10px] border-t border-b w-[100%] border-[black] text-center text-[18px] font-[500]">
            <div className="w-[100%] text-center flex justify-between items-center text-[14px] mb-[5px]">
              <div>No of Orders</div>
              <div>{data?.total_no_takeaway ?? 0}</div>
            </div>

            <div className="w-[100%] text-center flex justify-between items-center text-[14px]">
              <div>Gross</div>
              <div>
                {merchant?.currency?.symbol ?? <>&euro;</>}
                {data?.takeaway?.toFixed(2) ?? 0}
              </div>
            </div>
            <div className="w-[100%] text-center flex justify-between items-center text-[14px]">
              <div>Tax</div>
              <div>{merchant?.currency?.symbol ?? <>&euro;</>}0</div>
            </div>
            <div className="w-[100%] text-center flex justify-between items-center text-[14px]">
              <div>Total</div>
              <div>
                {merchant?.currency?.symbol ?? <>&euro;</>}
                {data?.takeaway?.toFixed(2) ?? 0}
              </div>
            </div>
            <div className="w-[100%] text-center flex justify-between items-center text-[14px] font-bold">
              <div>Net Amount</div>
              <div>
                {merchant?.currency?.symbol ?? <>&euro;</>}
                {data?.takeaway?.toFixed(2) ?? 0}
              </div>
            </div>
          </div>

          <div className="p-[10px] w-[100%] text-center flex justify-between items-center text-[14px] font-bold">
            <div>Total Payments ({data?.total_orders ?? 0})</div>
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
