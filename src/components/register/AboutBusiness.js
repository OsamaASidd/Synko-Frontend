"use client";
import { postRequest } from "@/utils/apiFunctions";
import { useState } from "react";
import { CiCircleInfo } from "react-icons/ci";
import InputField from "../common/InputField";
import CSpinner from "../common/CSpinner";
import CAlert from "../common/CAlert";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { getErrorMessageFromResponse } from "@/utils/helper";
export default function AboutBusiness(props) {
  const router = useRouter();
  const {
    setActiveStep,
    handleInputs,
    inputs,
    setInputs,
    handleError,
    currencies,
    isSelected,
    errors,
  } = props;
  const [show1, setShow1] = useState(false);

  const [loading, setLoading] = useState(false);
  const validate = () => {
    setLoading(true);
    let isValid = true;

    if (!inputs.merchant_name) {
      handleError("Business name required!", "merchant_name");
      isValid = false;
    }

    if (!inputs.currency_id) {
      handleError("Select currency for your business!", "currency_id");
      isValid = false;
    }

    if (isValid) {
      handleSubmit();
    } else {
      setLoading(false);
    }
  };
  const handleSubmit = () => {
    postRequest("/register", inputs)
      .then((res) => {
        Swal.fire({
          icon: "success",
          text: res.data.message,
        });
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div
        className={`${
          isSelected ? "block" : "hidden"
        } lg:w-[40%] md:w-[55%] sm:w-[70%] py-12 w-[90%] space-y-3`}
      >
        <div className="sm:text-[20px] text-[#545353]">Let’s get started</div>
        <div className="sm:text-[28px] text-[#171821] font-semibold">
          Tell us about your business
        </div>
        <div className="text-[#545353] font-light py-5 text-[14px]">
          {"We're"} excited to learn more about your business. Share a brief
          overview of what you do, your mission, and why {"you're"} passionate
          about it. This helps us tailor our services to best suit your unique
          needs.
        </div>

        <div className="py-2 space-y-3">
          <InputField
              name="business_type"
            placeholder="What Kind of business are you?"
            isSelectInput
            onChange={handleInputs}
            selectOptions={
              <>
                <option
                  key={1}
                  value="Individual / Sole Prorietorship"
                  className="py-2"
                
                >
                  Individual / Sole Prorietorship
                </option>
                <option
                  key={2}
                  value="Limited Liability Company (LLC)"
                  className="py-2"
                
                >
                  Limited Liability Company (LLC)
                </option>
                <option key={3} value="Private Company" className="py-2"
                >
                  Private Company
                </option>
                <option
                  key={4}
                  value="Public Company (Unlisted)"
                  className="py-2"
                 
                >
                  Public Company (Unlisted)
                </option>
                <option
                  key={5}
                  value="Charitable Organization"
                  className="py-2"
                
                >
                  Charitable Organization
                </option>
              </>
            }
          />

          <InputField
            name="merchant_name"
            type="text"
            onChange={handleInputs}
            onFocus={() => handleError(null, "merchant_name")}
            placeholder="What is your business name?"
            error={errors?.merchant_name}
          />
          <InputField
            name="phone_no"
            type="number"
            onChange={handleInputs}
            onFocus={() => handleError(null, "phone_no")}
            placeholder="Preferred Phone Number"
            error={errors?.phone_no}
          />
          <InputField
            name="currency_id"
            onChange={handleInputs}
            onFocus={() => handleError(null, "currency_id")}
            placeholder="Select Currency"
            error={errors?.currency_id}
            isSelectInput
            selectOptions={
              <>
                {currencies && currencies.length > 0 ? (
                  <>
                    {currencies.map((item, index) => (
                      <option key={index} value={item.id}>
                        {item.symbol + " " + item.short_name}
                      </option>
                    ))}
                  </>
                ) : (
                  <></>
                )}
              </>
            }
          />

          <div className="w-[100%] flex items-center space-x-3 px-3 py-4 text-[#656565]">
            <input
              onClick={() => setShow1(!show1)}
              type="checkbox"
              className="w-4 h-4"
            />
            <div className="text-[13px] sm:text-[14px] ">
              I have a mobile business without a permanent physical address.
            </div>
          </div>
          {!show1 && (
            <InputField
              name="address"
              type="text"
              onChange={handleInputs}
              onFocus={() => handleError(null, "address")}
              placeholder="Address"
              error={errors?.address}
            />
          )}
        </div>

        <div className="py-2 space-y-2">
          {/* <div className="w-[100%] flex justify-between items-center pr-3 rounded-[8px] border-2 border-[#D8D8D8] text-[#656565]">
            <select className="outline-none bg-[#F8F8F8] w-[100%] pl-3 py-5 rounded-[8px]">
              <option value="#">Estimated Annual Revenue</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="300">300</option>
            </select>
          </div> */}

          <button
            onClick={() => validate()}
            className="flex items-center justify-center bg-gradient-to-r from-[#7DE143] to-[#055938] text-white font-semibold sm:text-[20px] px-5 py-3 w-[100%] rounded-[8px] border-2 border-[#D8D8D8] !mt-[20px]"
            disabled={loading}
          >
            {loading == true ? <CSpinner /> : "Register"}
          </button>
        </div>
      </div>
    </>
  );
}
