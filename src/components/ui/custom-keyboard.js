import useDeviceVisibility from "@/hooks/useDeviceVisibility";
import React, { useEffect, useState } from "react";
import Draggable from "react-draggable"; // Import Draggable
import { IoMdCloseCircle } from "react-icons/io";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

export default function CustomKeyboard({
  onChange,
  onKeyPress = () => {},
  isShow = false,
  setIsShow,
  keyRef = null,
  useNumericLayout = false,
}) {
  const { isVisible, os } = useDeviceVisibility();
  const [keyboardLayout, setLayoutKeyboard] = useState("default");

  const handleShift = () => {
    const layoutName = keyboardLayout;
    setLayoutKeyboard(layoutName === "default" ? "shift" : "default");
  };

  const onHandleKeyPress = (button) => {
    if (button === "{shift}" || button === "{lock}") handleShift();
  };

  // Define a custom numeric layout
  const numericLayout = {
    default: ["1 2 3", "4 5 6", "7 8 9", ". 0 {bksp}"],
  };

  // isShow == false || os == "unknown_os"
  if (isShow == false || os == "unknown_os") return <></>;
  return (
    <Draggable cancel=".non-draggable">
      <div
        className={`${
          isVisible == true ? "fixed" : "hidden"
        } bottom-10 right-10 w-full max-w-[700px] z-[99999999999999999999999999999999999999999999999] bg-[#ebebeb] p-[20px] shadow-lg rounded-lg cursor-move`}
      >
        <button
          onClick={() => {
            setIsShow(false);
            console.log("BUTTON PE CLICK TO HUA HAI!");
          }}
          className="absolute right-[-20px] top-[-30px] z-[9999999] non-draggable"
        >
          <IoMdCloseCircle size={25} />
        </button>
        <Keyboard
          keyboardRef={(r) => (keyRef.current = r)}
          onChange={onChange}
          onKeyPress={(e) => {
            onKeyPress(e);
            onHandleKeyPress(e);
          }}
          layoutName={keyboardLayout}
          layout={useNumericLayout ? numericLayout : undefined}
        />
      </div>
    </Draggable>
  );
}
