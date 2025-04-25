import { useState, useEffect } from "react";

const useDeviceVisibility = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [os, setOs] = useState("unknown_os");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsVisible(window.innerWidth >= 770);
      };

      // Run once on mount
      handleResize();
    }
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const userAgent = navigator.userAgent;
      if (userAgent.includes("Android") || userAgent.includes("X11")) {
        setOs("android");
      } else {
        setOs("unknown_os");
      }
    }
  }, []);

  return { isVisible, os };
};

export default useDeviceVisibility;
