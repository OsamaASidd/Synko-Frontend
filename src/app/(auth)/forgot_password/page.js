"use client";
import { postRequest } from "@/utils/apiFunctions";
// import { CAlert, CSpinner } from "@coreui/react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CAlert from "@/components/common/CAlert";
import CSpinner from "@/components/common/CSpinner";
import { GlobalContext } from "@/context";
import Cookies from "js-cookie";
import Mainlogo from "../../../../public/svg/Mainlogo";

export default function ForgotPassword() {
  const { isAuthUser } = useContext(GlobalContext);

  const router = useRouter();

  const [inputs, setInputs] = useState({
    email: "",
    code: "",
    password: "",
    confirm_password: "",
  });

  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);

  const [alert, setAlert] = useState({ type: "danger", message: "" });
  const [loading, setLoading] = useState(false);

  const handleInputs = (event) => {
    setInputs((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleForgotPasswordSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
    postRequest("/forgot/password", inputs)
      .then(async (res) => {
        setAlert({ message: res.data.message, type: "success" });
        setIsEmailSubmitted(true);
      })
      .catch((err) => {
        if (err?.response?.data?.messages) {
          for (const [key, value] of Object.entries(
            err.response.data.messages
          )) {
            setAlert({ ...alert, message: value[0] });
          }
        } else {
          setAlert({ ...alert, message: err?.response?.data?.message });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleResetPasswordSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
    postRequest("/reset/password", inputs)
      .then(async (res) => {
        setAlert({ message: res.data.message, type: "success" });
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      })
      .catch((err) => {
        if (err?.response?.data?.messages) {
          for (const [key, value] of Object.entries(
            err.response.data.messages
          )) {
            setAlert({ ...alert, message: value[0] });
          }
        } else {
          setAlert({ ...alert, message: err?.response?.data?.message });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isAuthUser) router.push("/dashboard");
  }, [isAuthUser, router]);

  return (
    <div className="p-5 bg-[#171821] h-screen overflow-hidden w-[100%]">
      <div className="grid grid-cols-12">
        <div className="col-span-12 h-[calc(100vh-40px)] rounded-l-[12px] lg:col-span-4 md:col-span-5 px-3 xl:px-6 bg-[#000] text-[#f3f2e9]">
          <div className="flex flex-col mt-[40px]">
            <Mainlogo width={200} height={64} textColor={"#fff"} />
            <div className="flex flex-col justify-center space-y-5 w-[100%] h-[calc(100vh-180px)]">
              <div className="text-[24px] lg:text-[36px] font-semibold">
                Forgot Password
              </div>

              {alert.message && (
                <CAlert color={alert.type}>{alert.message}</CAlert>
              )}

              {isEmailSubmitted == false ? <></> : <></>}

              <form
                onSubmit={handleForgotPasswordSubmit}
                className={` ${
                  isEmailSubmitted == false ? "" : "hidden"
                } flex flex-col space-y-5 w-[100%]`}
              >
                <input
                  className="py-3 border-2 bg-[#F8F8F8] border-[#7DE143] outline-none text-[#000] rounded-lg px-2"
                  required
                  placeholder="user@sync.com"
                  name="email"
                  onChange={handleInputs}
                />

                <button
                  type="submit"
                  className="py-3 w-[100%] bg-gradient-to-r from-[#7DE143] to-[#055938] font-bold rounded-lg text-white text-center"
                  disabled={loading == true ? loading : loading}
                >
                  {loading == true ? <CSpinner /> : "Send Instructions"}
                </button>
              </form>

              <form
                onSubmit={handleResetPasswordSubmit}
                className={` ${
                  isEmailSubmitted == true ? "" : "hidden"
                } flex flex-col space-y-5 w-[100%]`}
              >
                <input
                  className="h-[57px] border-2 bg-[#F8F8F8] border-[#7DE143] outline-none text-[#000] rounded-lg px-2"
                  required
                  placeholder="Reset Code"
                  name="code"
                  onChange={handleInputs}
                />

                <input
                  className="h-[57px] border-2 bg-[#F8F8F8] border-[#7DE143] outline-none text-[#000] rounded-lg px-2"
                  required
                  placeholder="New Password"
                  name="password"
                  onChange={handleInputs}
                />

                <input
                  className="h-[57px] border-2 bg-[#F8F8F8] border-[#7DE143] outline-none text-[#000] rounded-lg px-2"
                  required
                  placeholder="Confirm New Password"
                  name="confirm_password"
                  onChange={handleInputs}
                />

                <button
                  type="submit"
                  className="h-[56px] w-[100%] bg-gradient-to-r from-[#7DE143] to-[#055938] font-bold rounded-lg text-white text-center"
                  disabled={loading == true ? loading : loading}
                >
                  {loading == true ? <CSpinner /> : "Send Instructions"}
                </button>
              </form>

              <div className="flex justify-between">
                <div className="h-[60px] lg:text-[18px] flex">
                  <span>
                    {"Back to "}
                    <Link
                      href="/login"
                      className="text-[#7DE143]"
                    >
                      Login
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 hidden md:block lg:col-span-8 md:col-span-7 h-[calc(100vh-40px)] ">
          <div className="w-[100%] h-full relative flex justify-center items-center flex-col bg-[#F8F8F8] rounded-r-[12px]">
            <h3 className="text-[#2F353E] text-[20px] xl:text-[25px] font-medium text-center w-[100%] lg:max-w-[60%] pt-16">
              Get everything
              <br /> for your restaurant at single point,
              <br /> syncing in single system
            </h3>
            <img
              src="/images/loginImage.png"
              className="lg:w-[500px] w-[350px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
