"use client";
import { postRequest } from "@/utils/apiFunctions";
// import { CAlert, CSpinner } from "@coreui/react";
import Link from "next/link";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import CSpinner from "@/components/common/CSpinner";
import { GlobalContext } from "@/context";
import Cookies from "js-cookie";
import { getErrorMessageFromResponse } from "@/utils/helper";
import Swal from "sweetalert2";
// import { cookies } from "next/headers";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MERCHANT, TOKEN, USERTOKEN } from "@/utils/constants";
import Mainlogo from "../../../../public/svg/Mainlogo";

export default function Login() {
  const { setIsAuthUser, setUser, setMerchant, setProfile, setUserRole } =
    useContext(GlobalContext);

  const router = useRouter();

  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputs = (event) => {
    setInputs((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
    postRequest("/login", inputs)
      .then(async (res) => {
        Swal.fire({
          text: res.data.message,
          icon: "success",
        });
        setIsAuthUser(true);
        setUser(res?.data?.user_data?.user);
        setProfile(res?.data?.user_data?.profile);
        setUserRole(res?.data?.user_data?.user_role);
        Cookies.set(TOKEN, JSON.stringify(res?.data?.token));
        localStorage.setItem(USERTOKEN, JSON.stringify(res?.data?.user_data));
        localStorage.setItem(
          MERCHANT,
          JSON.stringify(res?.data?.merchants[0].merchant)
        );
        setMerchant(res?.data?.merchants[0].merchant);
        setLoading(false);
        router.push("/dashboard");
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="p-5 bg-[#171821] h-screen overflow-hidden w-[100%]">
      <div className="grid grid-cols-12">
        <div className="col-span-12 h-[calc(100vh-40px)] rounded-l-[12px] lg:col-span-4 md:col-span-5 xl:px-6 bg-[#000] text-[#f3f2e9]">
          <div className="flex flex-col mt-[40px] px-4">
            <Mainlogo width={200} height={64} textColor={"#fff"} />
            <div className="flex flex-col justify-center space-y-5 w-[100%] h-[calc(100vh-180px)]">
              <div>
                <div className="text-[24px] sm:text-[36px] font-semibold py-2 max-md:text-center">
                  Log in
                </div>
                <div>
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col space-y-5 w-[100%] h-full"
                  >
                    <input
                      className=" py-3 outline-none text-[#2F353E] border-2 bg-[#F8F8F8] border-[#7DE143] rounded-lg px-2"
                      required
                      placeholder="user@synko.com"
                      name="email"
                      onChange={handleInputs}
                    />
                    <div className="relative">
                      <input
                        className="py-3 w-[100%] outline-none text-[#2F353E] border-2 bg-[#F8F8F8] border-[#7DE143] rounded-lg px-2 pr-10"
                        required
                        placeholder="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        onChange={handleInputs}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-2 text-white outline-none"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                    <button
                      type="submit"
                      className=" py-3 w-[100%] bg-gradient-to-r from-[#7DE143] to-[#055938] font-bold rounded-lg text-white text-center"
                      disabled={loading == true ? loading : loading}
                    >
                      {loading == true ? <CSpinner /> : "Login"}
                    </button>
                  </form>
                  <div className="flex justify-between space-x-2 pt-2">
                    <div className="flex">
                      <span className="text-[#F8F8F8] xl:text-[14px] text-[12px]">
                        {"Don't have account? "}
                        <Link href="/register" className="text-[#7DE143]">
                          Register
                        </Link>
                      </span>
                    </div>
                    <div className=" flex">
                      <Link
                        href="/forgot_password"
                        className="text-[#F8F8F8] xl:text-[14px] text-[12px]"
                      >
                        Forget Your Password?
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 hidden md:block lg:col-span-8 md:col-span-7 h-[calc(100vh-40px)] ">
          <div className="w-[100%] h-full relative flex justify-center items-center flex-col bg-[#F8F8F8] rounded-r-[12px]">
            <h3 className="text-[#2F353E] text-[20px] xl:text-[25px] font-medium text-center w-[100%] lg:max-w-[60%] pt-16">
              Get everything<br /> for your restaurant at single point,<br /> syncing in
              single system
            </h3>
            <img src="/images/loginImage.png" className="lg:w-[500px] w-[350px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
