"use client";
import CAlert from "@/components/common/CAlert";
import CSpinner from "@/components/common/CSpinner";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Register() {
  const router = useRouter();
  const [inputs, setInputs] = useState({
    fullname: "",
    email: "",
    password: "",
    merchant_name: "",
    address: "",
    currency_id: "",
    tax: "",
  });
  const [alert, setAlert] = useState({ type: "danger", message: "" });
  const [loading, setLoading] = useState(false);

  const [currencies, setCurrency] = useState([]);

  const getCurrencies = () => {
    getRequest(`/get-currency`).then((res) => {
      setCurrency(res?.data);
    });
  };

  const handleInputs = (event) => {
    setInputs((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
    postRequest("/register", inputs)
      .then((res) => {
        setLoading(false);
        setAlert({ message: res.data.message, type: "success" });
        event.target.reset();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        if (err?.response?.data?.messages) {
          for (const [key, value] of Object.entries(
            err.response.data.messages
          )) {
            setAlert({ ...alert, message: value[0] });
          }
        } else {
          setAlert({ ...alert, message: err?.response?.data?.message });
        }
      });
  };

  useEffect(() => {
    getCurrencies();
  }, [router]);

  return (
    <>
      <div className="lg:h-screen grid grid-cols-12">
        <div className="col-span-12 overflow-y-auto lg:col-span-4 px-5 bg-[#262c35] text-[#f3f2e9]">
          <div className="flex flex-col justify-center">
            <div className="flex flex-col space-y-5 w-[100%]">
              <img
                src="/images/logo.png"
                className="w-[300px] block m-auto my-[40px]"
                alt=""
              />
              <div className="text-[28px] font-semibold">Register</div>
              {alert.message && (
                <CAlert color={alert.type}>{alert.message}</CAlert>
              )}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col space-y-5 w-[100%]"
              >
                <input
                  className="h-[57px] border bg-[#262c35] border-[#13AAE0] rounded-lg px-2"
                  placeholder="Fullname*"
                  name="fullname"
                  type="text"
                  required
                  onChange={handleInputs}
                />
                <input
                  className="h-[57px] border bg-[#262c35] border-[#13AAE0] rounded-lg px-2"
                  placeholder="Email*"
                  name="email"
                  type="email"
                  required
                  onChange={handleInputs}
                />
                <input
                  className="h-[57px] border bg-[#262c35] border-[#13AAE0] rounded-lg px-2"
                  placeholder="Password*"
                  name="password"
                  type="password"
                  required
                  onChange={handleInputs}
                />

                <div className="text-[28px] font-semibold">Merchant Info</div>

                <input
                  className="h-[57px] border bg-[#262c35] border-[#13AAE0] rounded-lg px-2"
                  placeholder="Merchant Name*"
                  name="merchant_name"
                  type="text"
                  required
                  onChange={handleInputs}
                />

                <input
                  className="h-[57px] border bg-[#262c35] border-[#13AAE0] rounded-lg px-2"
                  placeholder="Merchant Address*"
                  name="address"
                  type="text"
                  required
                  onChange={handleInputs}
                />

                <select
                  required
                  name="currency_id"
                  onChange={handleInputs}
                  className="h-[57px] border bg-[#262c35] border-[#13AAE0] rounded-lg px-2"
                >
                  <option value="">Select Currency*</option>
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
                </select>

                <input
                  className="h-[57px] border bg-[#262c35] border-[#13AAE0] rounded-lg px-2"
                  placeholder="15%"
                  name="tax"
                  type="number"
                  required
                  onChange={handleInputs}
                />

                <button
                  type="submit"
                  className="h-[56px] w-[100%] bg-gradient-to-r from-[#13AAE0] to-[#18D89D] font-bold rounded-lg text-white text-center"
                  disabled={loading == true ? loading : loading}
                >
                  {loading == true ? <CSpinner /> : "Register"}
                </button>
              </form>
              <div className="flex justify-between">
                <div className="h-[60px] lg:text-[18px] flex space-y- ">
                  <span>
                    Already have account?{" "}
                    <Link
                      href="/login"
                      className=" bg-gradient-to-r text-transparent bg-clip-text from-[#13AAE0] to-[#18D89D] font-bold"
                    >
                      Login
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 h-screen">
          <div
            className="w-[100%] h-full relative flex justify-center items-center flex-col space-y-10"
            style={{
              backgroundImage: "url('/images/bg-color.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <h3 className="text-[white] text-[20px] sm:text-[25px] text-center w-[100%] max-w-[60%]">
              Get everything for your restaurant at single point, syncing in
              single system
            </h3>
            <img src="/images/bg.png" />
          </div>
        </div>
      </div>
    </>
  );
}
