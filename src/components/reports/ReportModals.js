"use client";
import OrderTypeSummary from "./OrderTypeSummay";
import PettyCash from "./PettyCash";
import SaleSummary from "./SaleSummary";

export default function ReportModals(props) {
  return (
    <>
      <SaleSummary {...props} />
      <OrderTypeSummary {...props} />
      <PettyCash {...props} />
    </>
  );
}
