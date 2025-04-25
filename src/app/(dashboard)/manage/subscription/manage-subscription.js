import Modal from "@/components/modal";
import { GlobalContext } from "@/context";
import useHandleInputs from "@/hooks/useHandleInputs";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { getErrorMessageFromResponse } from "@/utils/helper";
import { useContext, useEffect, useState } from "react";
import { RadioGroup, Radio } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Button from "@/components/ui/button";
import moment from "moment";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import CSpinner from "@/components/common/CSpinner";
import Swal from "sweetalert2";
import CompareSubscription from "./compare-subscription";

export default function ManageSubscriptions({
  modelIsOpen,
  setIsModalOpen,
  setIsDataUpdated,
  mySubscription,
}) {
  const router = useRouter();
  const { merchant } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(0);

  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const initialState = {
    subscription_price_id: "",
  };
  const [inputs, handleInputs, setInputs] = useHandleInputs(initialState);

  const [data, setData] = useState([]);
  const getData = () => {
    setLoading(true);
    getRequest(`/merchant/${merchant?.id}/subscription`)
      .then((res) => {
        setData(res?.data);
      })
      .catch((err) => {
        getErrorMessageFromResponse(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const contentwithSymbol = (content) => {
    const number = parseFloat(content || 0);
    return `${number.toFixed(2)}`;
  };

  const ifMySubscription = () => {
    // (!mySubscription && selectedSubscription?.initial_assigned == true) ||
    if (mySubscription?.subscription?.id == selectedSubscription?.id) {
      return true;
    }
    return false;
  };

  const getCheckOutURL = () => {
    if (!selectedPrice?.stripe_price_id) {
      Swal.fire({
        text: "Select the price to continue!",
        icon: "warning",
      });
      return;
    }
    setLoading(true);
    getRequest(
      `/pay-plan?price_id=${selectedPrice?.id}&stripe_price_id=${selectedPrice?.stripe_price_id}&subscription_id=${selectedSubscription?.id}`
    )
      .then((res) => {
        router.push(res?.data?.url);
      })
      .catch((err) => {
        setLoading(false);
        getErrorMessageFromResponse(err);
      })
      .finally();
  };

  const cancelSubscriptionPlan = () => {
    if (!mySubscription) {
      return;
    }
    Swal.fire({
      title: "Action Needed",
      text: "Are you sure you want to cancel this subscription?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        postRequest(`/cancel-plan`, {
          user_subscription_id: mySubscription?.id,
        })
          .then((res) => {
            Swal.fire({
              text: res?.data?.message,
              icon: "success",
            });
            setIsDataUpdated(true);
            setIsModalOpen(false);
          })
          .catch((err) => {
            getErrorMessageFromResponse(err);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  };

  const [comModel, setComModel] = useState(false);
  return (
    <>
      <Modal
        isOpen={modelIsOpen}
        heading={"Manage Subscriptions"}
        onClose={() => {
          setInputs(initialState);
          setIsModalOpen(false);
          setSelectedSubscription(null);
        }}
      >
        {comModel == true && (
          <CompareSubscription
            modelIsOpen={comModel}
            setIsModalOpen={setComModel}
            data={data}
          />
        )}

        <div className="flex justify-between">
          {!["Free Plan", "Basic Plan"].includes(
            mySubscription?.subscription?.name
          ) ? (
            <>
              <Button
                disabled={loading}
                onClick={() => {
                  if (mySubscription.is_continue == false) {
                    Swal.fire({
                      text: "You already cancelled this subscription plan!",
                      icon: "warning",
                    });
                    return;
                  }
                  cancelSubscriptionPlan();
                }}
                className={`!text-[12px]`}
              >
                {" "}
                {loading ? <CSpinner /> : "Cancel Plan"}
              </Button>
            </>
          ) : (
            <></>
          )}

          <Button
            onClick={() => {
              setComModel(true);
            }}
            className={`!text-[12px]`}
          >
            Compare Plans
          </Button>
        </div>

        <RadioGroup
          value={selectedSubscription}
          onChange={setSelectedSubscription}
          className={` ${step == 1 ? "hidden" : ""} space-y-2`}
        >
          {data && data?.length > 0 ? (
            <>
              {data?.map((plan, index) => {
                if (["Free Plan", "Basic Plan"].includes(plan.name)) {
                  return <></>;
                }
                return (
                  <Radio
                    key={index}
                    value={plan}
                    className="group relative flex cursor-pointer data-[checked]:border-[2px] border-[#055938] rounded-lg bg-white/5 py-4 px-5 text-black shadow-md transition focus:outline-none data-[focus]:outline-1 data-[focus]:outline-black data-[checked]:bg-white/10"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="text-sm/6">
                        {mySubscription?.subscription?.id == plan?.id ? (
                          <>
                            <div className="text-[10px] font-bold">Current</div>
                          </>
                        ) : (
                          <></>
                        )}
                        <p className="font-semibold text-black">{plan?.name}</p>
                        {plan?.description ? (
                          <>
                            <p className="text-black">{plan?.description}</p>
                          </>
                        ) : (
                          <></>
                        )}
                        <div className="flex gap-2 text-black/50">
                          {(plan?.monthly_price?.price == 0 &&
                            plan?.yearly_price?.price == 0) ||
                          plan?.name == "Basic Plan" ? (
                            <>Free</>
                          ) : (
                            <>
                              <div>
                                &euro;
                                {contentwithSymbol(plan?.monthly_price?.price)}
                                /m
                              </div>
                              <div aria-hidden="true">&middot;</div>
                              <div>
                                &euro;
                                {contentwithSymbol(plan?.yearly_price?.price)}/y
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <CheckCircleIcon className="w-[30px] fill-[#055938] opacity-0 transition group-data-[checked]:opacity-100" />
                    </div>
                  </Radio>
                );
              })}
            </>
          ) : (
            <></>
          )}
        </RadioGroup>

        <RadioGroup
          value={selectedPrice}
          onChange={setSelectedPrice}
          className={` ${step == 0 ? "hidden" : ""} space-y-2`}
        >
          {selectedSubscription?.monthly_price?.price == 0 &&
          selectedSubscription?.yearly_price?.price == 0 ? (
            <></>
          ) : (
            <>
              <Radio
                key={"index-monthly"}
                value={selectedSubscription?.monthly_price}
                className="group relative flex cursor-pointer data-[checked]:border-[2px] border-[#055938] rounded-lg bg-white/5 py-4 px-5 text-black shadow-md transition focus:outline-none data-[focus]:outline-1 data-[focus]:outline-black data-[checked]:bg-white/10"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="text-sm/6">
                    <p className="font-semibold text-black">1 Month</p>
                    <div className="flex gap-2 text-black/50">
                      Expires {moment().add(1, "months").format("MMM D, YYYY")}
                    </div>
                  </div>
                </div>
                <div>
                  &euro;
                  {contentwithSymbol(
                    selectedSubscription?.monthly_price?.price
                  )}
                  /m
                </div>
              </Radio>
              <Radio
                key={"index-yearly"}
                value={selectedSubscription?.yearly_price}
                className="group relative flex cursor-pointer data-[checked]:border-[2px] border-[#055938] rounded-lg bg-white/5 py-4 px-5 text-black shadow-md transition focus:outline-none data-[focus]:outline-1 data-[focus]:outline-black data-[checked]:bg-white/10"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="text-sm/6">
                    <p className="font-semibold text-black">1 Year</p>
                    <div className="flex gap-2 text-black/50">
                      Expires {moment().add(1, "years").format("MMM D, YYYY")}
                    </div>
                  </div>
                </div>
                <div>
                  &euro;
                  {contentwithSymbol(selectedSubscription?.yearly_price?.price)}
                  /y
                </div>
              </Radio>
            </>
          )}
        </RadioGroup>

        <div className="flex justify-center space-x-4 w-[100%] gap-x-[10px]">
          {step == 1 ? (
            <>
              <Button
                className={`!text-[14px]`}
                onClick={() => {
                  setStep(0);
                }}
              >
                Back
              </Button>
            </>
          ) : (
            <></>
          )}
          <Button
            disabled={ifMySubscription() || (loading && step == 1)}
            className={` ${
              ifMySubscription() == true ? "!bg-[#fff]" : ""
            } !text-[14px]`}
            onClick={() => {
              if (step == 1) {
                getCheckOutURL();
              } else {
                setStep(1);
              }
            }}
          >
            {loading && step == 1 ? <CSpinner /> : "Next"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
