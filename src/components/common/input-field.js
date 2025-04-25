"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function InputField({
  label,
  placeholder,
  type,
  name,
  onChange = () => {},
  error,
  password,
  onFocus = () => {},
  isSelectInput,
  selectOptions,
  defaultSelected = null,
  isDark,
  isDisabled,
  value,
  required,
  icon,
  className,
}) {
  const [hidePassword, setHidePassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div>
      {label && (
        <h6 className="w-full text-sm sm:text-[16px] font-[400] mb-[8px]">
          {label}
          {required && <span className="text-[#F30000]">*</span>}
        </h6>
      )}

      {isSelectInput ? (
        <>
          <div
            className={`${className} flex justify-between items-center gap-x-[10px] w-full border-[1.41px] border-[#EBEBEB] rounded-[7px] bg-[white] min-h-[42.32px] px-[10px]`}
          >
            {icon}
            <select
              name={name}
              onChange={onChange}
              onFocus={() => {
                onFocus();
                setIsFocused(true);
              }}
              onBlur={() => setIsFocused(false)}
              className={`outline-none w-full`}
              required={required}
              defaultValue={defaultSelected}
            >
              <option value="">{placeholder}</option>
              {selectOptions}
            </select>
          </div>
          {error && <div className="text-[red]">{error}</div>}
        </>
      ) : (
        <>
          <div
            className={`${className} flex justify-between items-center gap-x-[10px] w-full border-[1.41px] border-[#EBEBEB] rounded-[7px] bg-[white] py-3 px-[10px]`}
          >
            {icon}
            <input
              className={`outline-none w-full`}
              placeholder={placeholder ?? ""}
              onFocus={() => {
                onFocus();
                setIsFocused(true);
              }}
              onBlur={() => {
                setIsFocused(false);
              }}
              onChange={onChange}
              type={password ? (hidePassword ? "text" : "password") : type}
              name={name}
              disabled={isDisabled ? true : false}
              value={value ? value : null}
              required={required}
            />
            {password && (
              <span
                onClick={() => setHidePassword(!hidePassword)}
                className="cursor-pointer"
              >
                {hidePassword ? (
                  <FaEye
                    color={`${isDark ? "white" : "black"}`}
                    fontSize={20}
                  />
                ) : (
                  <FaEyeSlash
                    color={`${isDark ? "white" : "black"}`}
                    fontSize={20}
                  />
                )}
              </span>
            )}
          </div>
        </>
      )}
      {error && <div className="text-[red]">{error}</div>}
    </div>
  );
}
