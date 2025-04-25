"use client";

import AboutBusiness from "@/components/register/AboutBusiness";
import CreateAccount from "@/components/register/CreateAccount";
import MobileVerification from "@/components/register/MobileVerification";
import { GlobalContext } from "@/context";
import { getRequest } from "@/utils/apiFunctions";
import { registration_steps } from "@/utils/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Mainlogo from "../../../../public/svg/Mainlogo";

export default function Register() {
  const { isAuthUser, user, merchant } = useContext(GlobalContext);
  const router = useRouter();

  const [inputs, setInputs] = useState({
    fullname: "",
    business_type: "",
    email: "",
    password: "",
    country: "",
    code: "",
    merchant_name: "",
    currency_id: "",
    address: "",
    phone_no: "",
    total_employees: "",
    typical_monthly_sale: "",
  });
  const [activeStep, setActiveStep] = useState(registration_steps.first_step);

  const [currencies, setCurrency] = useState([]);

  const getCurrencies = () => {
    getRequest(`/get-currency`, {}, true).then((res) => {
      setCurrency(res?.data);
    });
  };

  const [errors, setErrors] = useState({});
  const handleError = (text, input) => {
    setErrors((prev) => ({
      ...prev,
      [input]: text,
    }));
  };

  const handleInputs = (event) => {
    setInputs((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    getCurrencies();
  }, [router]);

  useEffect(() => {
    if (
      user != null &&
      typeof user === "object" &&
      typeof merchant === "object"
    ) {
      function isEmpty(obj) {
        return Object?.keys(obj)?.length === 0;
      }

      if (isEmpty(user) == false && isEmpty(merchant) == false) {
        router.push("/dashboard");
      }
    }
  }, [merchant, user, router]);

  return (
    <>
      <div className="bg-[#171821] w-[100%] h-screen overflow-y-auto p-3 sm:p-10 relative">
        <div className="bg-[#F8F8F8] w-[100%] h-[calc(100vh-80px)] overflow-y-auto rounded-[15px] flex flex-col items-center justify-center">
          <div className="flex w-[100%] items-center space-x-2 p-7 justify-between">
            {activeStep !== registration_steps.second_step && (
              <div className="fixed top-12">
                <Link href={"/"}>
                  <Mainlogo width={150} height={54} textColor={"#000"} />
                </Link>
              </div>
            )}

            {activeStep == registration_steps.second_step && (
              <div className="flex justify-end px-8 py-1">
                <button
                  onClick={() => {
                    setActiveStep(registration_steps.first_step);
                  }}
                  className="bg-gradient-to-r from-[#7DE143] to-[#055938] text-white font-semibold sm:text-[20px] px-10 py-3 rounded-[8px]"
                >
                  Go back
                </button>
              </div>
            )}
          </div>

          <CreateAccount
            setActiveStep={setActiveStep}
            setInputs={setInputs}
            inputs={inputs}
            handleInputs={handleInputs}
            handleError={handleError}
            setErrors={setErrors}
            errors={errors}
            isSelected={activeStep == registration_steps.first_step}
          />

          <AboutBusiness
            setActiveStep={setActiveStep}
            setInputs={setInputs}
            inputs={inputs}
            handleInputs={handleInputs}
            currencies={currencies}
            handleError={handleError}
            setErrors={setErrors}
            errors={errors}
            isSelected={activeStep == registration_steps.second_step}
          />

          {/* {activeStep == registration_steps.third_step && (
            <MobileVerification
              setActiveStep={setActiveStep}
              isSelected={activeStep == registration_steps.third_step}
            />
          )} */}
        </div>
      </div>
    </>
  );
}
