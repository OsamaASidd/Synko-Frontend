import Modal from "@/components/modal";
import { GlobalContext } from "@/context";
import { useContext, useState } from "react";

export default function CompareSubscription({
  modelIsOpen,
  setIsModalOpen,
  data,
}) {
  const { merchant } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);

  const contentwithSymbol = (content) => {
    const number = parseFloat(content || 0);
    return `${number.toFixed(2)}`;
  };

  return (
    <>
      <Modal
        isOpen={modelIsOpen}
        heading={"Compare Subscription Plans"}
        onClose={() => {
          setIsModalOpen(false);
        }}
        type={true}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[20px] px-3 py-5 md:p-[30px]">
          {data && data?.length > 0 ? (
            <>
              {data?.map((plan, index) => {
                return (
                  <div
                    key={index}
                    className="p-4 md:p-[30px] bg-[#fff] border border-[#055938] text-[#000] rounded-[10px] min-h-[400px]"
                  >
                    <h4 className="text-[28px] md:text-[35px]">{plan?.name}</h4>
                    <div className="text-[20px] md:mt-[10px] text-[#545353]">
                      {(plan?.monthly_price?.price == 0 &&
                        plan?.yearly_price?.price == 0) ||
                      plan?.name == "Basic Plan" ? (
                        <>Free</>
                      ) : (
                        <>
                          &euro;
                          {contentwithSymbol(plan?.monthly_price?.price)}
                          <span className="text-[10px]"> /per month</span>
                        </>
                      )}
                    </div>
                    <hr className="outline-[red] my-5 md:my-[40px]" />
                    <ul className="flex flex-col gap-y-[10px] max-h-[370px] overflow-y-auto text-[#545353]">
                      {plan?.subscription_items &&
                      plan?.subscription_items?.length > 0 ? (
                        <>
                          {plan?.subscription_items.map((pln, indx) => {
                            return (
                              <li key={indx} className="capitalize">
                                {pln?.item_type == "numbered" &&
                                pln?.is_unlimited == false
                                  ? pln?.item_value
                                  : pln?.is_unlimited == true
                                  ? "Unlimited"
                                  : ""}{" "}
                                {pln?.name?.replace(/_/g, " ")}
                              </li>
                            );
                          })}
                        </>
                      ) : (
                        <></>
                      )}
                    </ul>
                  </div>
                );
              })}
            </>
          ) : (
            <></>
          )}
        </div>
      </Modal>
    </>
  );
}
