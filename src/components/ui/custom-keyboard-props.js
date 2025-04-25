import useDeviceVisibility from "@/hooks/useDeviceVisibility";
import { useEffect, useRef, useState } from "react";

const useCustomKeyboardProps = (inputs, setInputs, isOldData = false) => {
  const [keyboardShow, setKeyboardShow] = useState(false);
  const keyboardRef = useRef(null);
  const { isVisible, os } = useDeviceVisibility();
  const [focusedInput, setFocusedInput] = useState(null);
  const [isNumericType, setIsNumericType] = useState(false);

  const handleKeyboardInput = (value) => {
    if (isOldData == false) {
      setInputs({ [focusedInput]: value });
    } else {
      setInputs({ ...inputs, [focusedInput]: value });
    }
  };
  const handleInputFocus = (inputName) => {
    setFocusedInput(null); // Reset focusedInput temporarily
    setTimeout(() => setFocusedInput(inputName), 10); // Set it back with a short delay
  };

  useEffect(() => {
    if (focusedInput !== null) {
      setKeyboardShow(true);
      setTimeout(() => {
        if (keyboardRef.current) {
          keyboardRef.current.setInput(inputs[focusedInput] || ""); // Sets initial value in keyboard
        }
      }, 500); // Adjust timeout as needed for your component render timing
    } else {
      setKeyboardShow(false);
      if (keyboardRef.current) {
        keyboardRef.current.setInput(""); // Clears the keyboard input
      }
    }
  }, [focusedInput, inputs]);

  return {
    keyboardShow,
    setKeyboardShow,
    keyboardRef,
    isVisible,
    os,
    focusedInput,
    handleKeyboardInput,
    handleInputFocus,
    setIsNumericType,
    isNumericType,
  };
};
export default useCustomKeyboardProps;
