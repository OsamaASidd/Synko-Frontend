import React, { useEffect, useRef, useState } from "react";
import { BsThreeDots } from "react-icons/bs";

const Actions = ({ item, navActions }) => {
  const [openAction, setOpenAction] = useState(null);
  const dropdownRef = useRef(null);

  const setIsOpenAction = (id) => {
    setOpenAction(openAction === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenAction(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpenAction(item.id)}>
        <BsThreeDots
          size={22}
          color={openAction === item?.id ? "#055938" : "black"}
        />
      </button>
      {openAction === item.id && (
        <div className="flex flex-col shadow-lg z-50  bg-[#fff]  top-2.5  absolute right-[5rem] sm:right-24 ">
          {navActions?.map((action, index) => (
            <button
              key={index}
              onClick={action?.func}
              className="hover:bg-gray-100 text-start px-5 py-1.5"
            >
              {action?.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Actions;
