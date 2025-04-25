"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function InputField(props) {
  const {
    label,
    placeholder,
    type,
    name,
    onChange = () => { },
    error,
    password,
    onFocus = () => { },

    isSelectInput,
    selectOptions,
  } = props;

  const [hidePassword, setHidePassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  return (
    <>
      <div>
        <div
          className={`${error
              ? "border-[red]"
              : isFocused
                ? "border-[#055938]"
                : "border-[#D8D8D8]"
            } flex justify-between items-center w-[100%] px-3 py-2 rounded-[8px] border-2  text-[#656565]`}
        >
          <div className="w-[100%]">
            {label && <div className="text-black font-semibold">{label}</div>}
            <div>
              {isSelectInput ? (
                <>
                  <select
                    name={name}
                    onChange={onChange}
                    onFocus={() => {
                      onFocus();
                      setIsFocused(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                    className="outline-none bg-[#F8F8F8] w-[100%]"
                  >
                    <option>{placeholder}</option>
                    {selectOptions}
                  </select>
                </>
              ) : (
                <>
                  <input
                    className="outline-none w-[100%] bg-transparent"
                    placeholder={placeholder ?? ""}
                    onFocus={() => {
                      onFocus();
                      setIsFocused(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                    onChange={onChange}
                    type={
                      password ? (hidePassword ? "text" : "password") : type
                    }
                    name={name}
                  />
                </>
              )}
            </div>
          </div>
          {password && (
            <span
              onClick={() => setHidePassword(!hidePassword)}
              className="cursor-pointer"
            >
              {hidePassword ? (
                <FaEye fontSize={20} />
              ) : (

                <FaEyeSlash fontSize={20} />
              )}
            </span>
          )}
        </div>
        {error && <div className="text-[red]">{error}</div>}
      </div>
    </>
  );
}
