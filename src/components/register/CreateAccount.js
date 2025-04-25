"use client";

import { registration_steps } from "@/utils/constants";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaCheck } from "react-icons/fa";
import countryList from "react-select-country-list";
import InputField from "../common/InputField";
import CSpinner from "../common/CSpinner";
import { postRequest } from "@/utils/apiFunctions";
import Swal from "sweetalert2";
import { getErrorMessageFromResponse } from "@/utils/helper";

export default function CreateAccount(props) {
  const {
    setActiveStep,
    handleInputs,
    inputs,
    isSelected,
    handleError,
    errors,
  } = props;
  const options = useMemo(() => countryList().getData(), []);

  const [isChecked, setChecked] = useState(false);

  const handleCheckboxClick = () => {
    setChecked(!isChecked);
  };

  const [isVerifiedCodeSend, setIsVerifiedCodeSend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const validate = () => {
    setLoading(true);
    let isValid = true;

    if (!inputs.email) {
      handleError("Email field is required!", "email");
      isValid = false;
    } else if (!inputs.email.match(/\S+@\S+\.\S+/)) {
      handleError("Invalid email!", "email");
      isValid = false;
    }

    if (!inputs.fullname) {
      handleError("Fullname field required!", "fullname");
      isValid = false;
    }

    if (!inputs.password) {
      handleError("Password field required!", "password");
      isValid = false;
    } else if (inputs.password.length < 6) {
      handleError("Min password length of 6!", "password");
      isValid = false;
    }

    if (!inputs.country) {
      handleError("Country field required!", "country");
      isValid = false;
    }

    if (!isChecked) {
      Swal.fire({
        icon: "error",
        text: "Please agree to our Terms and Conditions and Privacy Policy to continue.",
      });
      isValid = false;
    }

    if (isValid) {
      if (isVerifiedCodeSend) {
        handleVerifyCode;
      } else {
        handleData();
      }
    } else {
      setLoading(false);
    }
  };

  const handleData = () => {
    postRequest(`/validation/users/email`, inputs, "POST", true)
      .then((res) => {
        postRequest(`/user/email/send_code`, inputs, "POST", true)
          .then((res) => {
            setIsVerifiedCodeSend(true);
            startTimer();
            Swal.fire({
              icon: "success",
              text: res.data.message,
            });
          })
          .catch((err) => {
            console.log(err);
            getErrorMessageFromResponse(err);
          });
      })
      .catch((err) => {
        console.log(err);
        if (err?.response?.data?.messages) {
          for (const [key, value] of Object.entries(
            err.response.data.messages
          )) {
            handleError(value[0], key);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const startTimer = () => {
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
    }, 30000);
  };

  const handleResendEmail = () => {
    setIsVerifiedCodeSend(true);
    handleData();
  };

  const handleVerifyCode = () => {
    postRequest(`/user/email/verify_code`, inputs, "POST", true)
      .then((res) => {
        setActiveStep(registration_steps.second_step);
      })
      .catch((err) => {
        getErrorMessageFromResponse(err);
      });
  };

  useEffect(() => {
    if (isVerifiedCodeSend) {
      startTimer();
    }
  }, [isVerifiedCodeSend]);

  return (
    <>
      <div
        className={`${
          isSelected ? "block" : "hidden"
        } lg:w-[40%] md:w-[55%] sm:w-[70%] w-[90%] no-scrollbar sm:overflow-y-visible overflow-y-auto space-y-3 h-[calc(100vh-240px)]`}
      >
        <div className="leading-none">
          <div className="sm:text-[30px] text-[#171821] font-bold">
            Let’s create your account.
          </div>
          <div className="text-[#545353] sm:text-[16px] text-[14px] leading-6 pt-3">
            Signing up for Synko is fast & free. <br />
            No commitments or long-term contracts.
          </div>
        </div>

        <div className="space-y-3">
          <InputField
            label="Enter your name*"
            name="fullname"
            type="text"
            onChange={handleInputs}
            onFocus={() => handleError(null, "fullname")}
            placeholder="John Doe"
            error={errors?.fullname}
          />

          <InputField
            label="Enter your email*"
            name="email"
            type="email"
            onChange={handleInputs}
            onFocus={() => handleError(null, "email")}
            placeholder="abc@mail.com"
            error={errors?.email}
          />

          <InputField
            label="Password*"
            name="password"
            type="password"
            onChange={handleInputs}
            onFocus={() => handleError(null, "password")}
            placeholder="******"
            error={errors?.password}
            password
          />

          <InputField
            label="Country*"
            name="country"
            onChange={handleInputs}
            onFocus={() => handleError(null, "country")}
            placeholder="Select Country"
            error={errors?.country}
            isSelectInput
            selectOptions={
              <>
                {options?.length > 0 ? (
                  <>
                    {options.map((item, index) => (
                      <>
                        <option key={index} value={item.value}>
                          {item.label}
                        </option>
                      </>
                    ))}
                  </>
                ) : (
                  <></>
                )}
              </>
            }
          />
          {isVerifiedCodeSend && (
            <div>
              <InputField
                label="Verification Code*"
                name="code"
                type="text"
                onChange={handleInputs}
                onFocus={() => handleError(null, "code")}
                placeholder="******"
                error={errors?.code}
              />
              {/* {timer === 0 && (
                <button
                  className=" bg-gradient-to-r from-[#7DE143] to-[#055938] text-white font-semibold sm:text-[20px] px-3 py-2 rounded-[8px] border-2 border-[#D8D8D8]"
                  onClick={handleResendEmail}
                >
                  Resend Email
                </button>
              )} */}
            </div>
          )}

          <div className="w-[100%] flex items-center space-x-3 px-3 py-1 rounded-[8px]">
            <div
              onClick={handleCheckboxClick}
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: isChecked ? "#7DE143" : "#FFFFFF",
                border: "1px solid #7DE143",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {isChecked && <FaCheck color="#FFFFFF" />}
            </div>
            <div className="sm:text-[17px] text-[15px]">
              I agree to Synko{" "}
              <Link
                target="_blank"
                href={"https://synko.tech/privacy-policy/"}
                className="text-[#7DE143]"
              >
                Terms & Privacy Policy.
              </Link>
            </div>
          </div>
          <div className="text-[#545353] w-[100%] px-3 py-1 sm:text-[16px] text-[14px]">
            This site is protected by reCAPTCHA Enterprise and the Google
            Privacy Policy and Terms of Service apply.
          </div>

          {!isVerifiedCodeSend && (
            <button
              onClick={() => validate()}
              className="flex items-center justify-center bg-gradient-to-r from-[#7DE143] to-[#055938] text-white font-semibold sm:text-[18px] px-5 py-3 w-[100%] rounded-[8px] border-2 border-[#D8D8D8]"
              disabled={loading}
            >
              {loading ? <CSpinner /> : "Send Code"}
            </button>
          )}

          {isVerifiedCodeSend && (
            <>
              <button
                onClick={() => handleVerifyCode()}
                className="flex items-center justify-center bg-gradient-to-r from-[#7DE143] to-[#055938] text-white font-semibold sm:text-[18px] px-5 py-3 w-[100%] rounded-[8px] border-2 border-[#D8D8D8]"
                disabled={loading}
              >
                {loading == true ? <CSpinner className="my-4" /> : "Continue"}
              </button>
              {/* <div className="flex justify-center cursor-pointer text-[#7DE143]">
             <a
                className=" text-black"
                onClick={handleResendEmail}
              >
               Didn't receive a code? Resend?
              </a>
              </div> */}
              <a
                disabled={timer > 0}
                className={
                  "text-black mt-4 justify-center  w-full font-normal sm:text-[18px] px-3 py-2"
                }
                onClick={handleResendEmail}
              >
                Did not receive a code?{" "}
                <span
                  className={` ${
                    timer == 0
                      ? "text-[#7DE143] cursor-pointer"
                      : "text-gray-400 cursor-not-allowed"
                  } `}
                >
                  Resend {timer > 0 ? `(${timer})` : null}{" "}
                </span>
              </a>
            </>
          )}
          {/* {timer === 0 && ( */}

          {/* )} */}

          <div className="text-[#545353] text-center py-1 pb-10">
            Already have an account?{" "}
            <Link href={"/"}>
              <span className="sm:text-[18px] text-[#7DE143]">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
