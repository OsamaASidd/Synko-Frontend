"use client";
import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "@/context";
import SideMenu from "@/components/menus/SideMenu";
import CSpinner from "@/components/common/CSpinner";
import useHandleInputs from "@/hooks/useHandleInputs";
import { postRequest, getRequest } from "@/utils/apiFunctions";
import Swal from "sweetalert2";
import { getErrorMessageFromResponse } from "@/utils/helper";
import InputsInfoBox from "@/components/ui/inputs-info-box";
import InputField from "@/components/common/input-field";
import Button from "@/components/ui/button";
import Switch from "@mui/material/Switch";
import ProtectedRoute from "@/components/protected-route";
import Printers from "./printers";
import { MERCHANT, TOKEN, USERTOKEN } from "@/utils/constants";

export default function Settings() {
  const {
    user,
    merchant,
    setIsAuthUser,
    setUser,
    setMerchant,
    setProfile,
    setUserRole,
  } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [isEmployLogin, setIsEmployLogin] = useState(false);
  const [inputs, handleInputs, setInputs] = useHandleInputs({
    old_password: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const handleError = (text, input) => {
    setErrors((prev) => ({
      ...prev,
      [input]: text,
    }));
  };
  const validate = () => {
    setLoading(true);
    let isValid = true;

    if (!inputs.old_password) {
      handleError("Current password field required!", "old_password");
      isValid = false;
    }

    if (!inputs.password) {
      handleError("New password field required!", "password");
      isValid = false;
    }

    if (isValid) {
      handleRequest();
    } else {
      setLoading(false);
    }
  };

  const handleChangeRole = () => {
    postRequest(`/merchant/${merchant?.id}/setting/update-employee-login`)
      .then((res) => {
        console.log("response is  ", res);
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };

  // const merchantFunction = () => {
  //   getRequest(`/merchant/${merchant?.id}/employees/isLogin`)
  //     .then((res) => {
  //       console.log("response is  ", res.data);
  //       if (
  //         res.data?.is_employee_login == true ||
  //         res.data?.is_employee_login == 1
  //       ) {
  //         setIsEmployLogin(true);
  //       } else {
  //         setIsEmployLogin(false);
  //       }
  //     })
  //     .catch((err) => getErrorMessageFromResponse(err))
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // };

  useEffect(() => {
    if (
      merchant?.is_employee_login == true ||
      merchant?.is_employee_login == 1
    ) {
      setIsEmployLogin(true);
    }

    // if (merchant?.id) {
    //   merchantFunction();
    // }
  }, [user, merchant]);

  const handleSwitch = async () => {
    setIsEmployLogin(!isEmployLogin);
    handleChangeRole();
  };

  const logout = () => {
    try {
      localStorage.removeItem(USERTOKEN);
    } catch (error) {}

    try {
      localStorage.removeItem(TOKEN);
    } catch (error) {}

    try {
      localStorage.removeItem(MERCHANT);
    } catch (error) {}

    try {
      Cookies.remove(TOKEN);
    } catch (error) {}

    setIsAuthUser(false);
    setUser({});
    setProfile({});
    setUserRole({});
    setMerchant({});
    window.location.href = "/login";
    // router.push("/login");
  };
  const handleLogout = () => {
    postRequest("/logout", {})
      .then((res) => {
        logout();
      })
      .catch((err) => {
        logout();
      })
      .finally(() => {
        logout();
      });
  };

  const handleRequest = () => {
    postRequest(`/change-password`, inputs)
      .then((res) => {
        Swal.fire({
          text: res?.data?.message,
          icon: "success",
        });
        handleLogout();
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };

  // useEffect(() => {
  //   merchantFunction();
  // }, [isEmployLogin]);

  return (
    <ProtectedRoute pageName={"settings"}>
      <div className="min-h-screen flex bg-[#171821]">
        <SideMenu />

        <div className="w-[100%] xl:ml-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6 h-screen overflow-auto text-black bg-[#171821]">
          <div className="w-[100%] min-h-full  bg-[#F8F8F8] rounded-[20px]  py-10 lg:p-10 px-3 md:px-8  lg:pr-16">
            <div className="w-[100%] border-b-2 text-[24px] py">Settings</div>
            <div className="w-[100%] flex justify-end py-5 items-center"></div>
            <div className="flex flex-col gap-y-[20px]">
              <InputsInfoBox
                className={"!px-5 !text-[18px] !pb-[20px]"}
                title={"Update Password"}
              >
                <div className="space-y-2 mt-[40px]">
                  <InputField
                    name="old_password"
                    type="password"
                    placeholder={"Current Password*"}
                    label={"Current Password"}
                    required={true}
                    password
                    onChange={handleInputs}
                    onFocus={() => handleError(null, "old_password")}
                    error={errors?.old_password}
                  />
                  <InputField
                    name="password"
                    type="password"
                    placeholder={"New Password*"}
                    label={"New Password"}
                    required={true}
                    password
                    onChange={handleInputs}
                    onFocus={() => handleError(null, "password")}
                    error={errors?.password}
                  />
                  <InputField
                    name="confirm_password"
                    type="password"
                    placeholder={"Confirm New Password*"}
                    label={"Confirm New Password"}
                    required={true}
                    password
                    onChange={handleInputs}
                    onFocus={() => handleError(null, "confirm_password")}
                    error={errors?.confirm_password}
                  />
                </div>
                <div className="w-full flex justify-end items-center mt-[20px]">
                  <button
                    className="w-fit px-5 py-3 rounded-[8px] font-semibold bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                    onClick={() => {
                      validate();
                    }}
                  >
                    {loading == true ? <CSpinner /> : "Update Password"}
                  </button>
                </div>
              </InputsInfoBox>
              <div className="grid grid-cols-1 gap-y-[20px]">
                <InputsInfoBox
                  className={"!px-5 !text-[18px] !pb-[20px]"}
                  title={"Employee Login on POS"}
                >
                  <div className="flex mt-[40px] justify-between items-center">
                    <div className="mr-5 flex flex-col justify-center">
                      <span>Employee Login</span>
                      <span className="text-[12px]">
                        Once this option is checked, the POS user will need to
                        enter their user PIN every time they place an order.
                      </span>
                    </div>
                    <div>
                      <Switch onChange={handleSwitch} checked={isEmployLogin} />
                    </div>
                  </div>
                </InputsInfoBox>
                {/* <Printers /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
