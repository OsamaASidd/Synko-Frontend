import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";
import { ifPagePermission } from "@/utils/helper";

const DropdownMenu = ({ item, currentRoute, isUserRole, mySubscription }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isSubmenuItemSelected = item?.menuItems?.some(
    (subItem) => currentRoute === subItem.href
  );

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {item?.menuItems ? (
        // For items with submenus
        <div
          onClick={toggleDropdown}
          className={`flex space-x-3 items-center pl-3 rounded-md hover:bg-gradient-to-r from-[#7DE143] to-[#055938] py-[6px] cursor-pointer ${
            isOpen ? "bg-gradient-to-r" : ""
          }`}
        >
          {item.iconSrc && (
            <img src={item.iconSrc} alt={item.label} className="w-[15px]" />
          )}
          <div className="text-[16px]">{item.label}</div>
          <span className="text-[16px] block !ml-auto pr-[10px]">
            {/* Dropdown icon */}
            <FaChevronRight />
          </span>
        </div>
      ) : (
        // For single-link items
        <Link
          href={item?.href || "/default-url"}
          className={`flex space-x-3 items-center pl-3 rounded-md hover:bg-gradient-to-r from-[#7DE143] to-[#055938] py-[6px] ${
            currentRoute === item?.href ? "bg-gradient-to-r" : ""
          }`}
        >
          {item?.iconSrc && (
            <img src={item.iconSrc} alt={item.label} className="w-[15px]" />
          )}
          <span className="text-[16px]">{item?.label}</span>
        </Link>
      )}

      {/* {isOpen && item?.menuItems && (
        <div className="absolute left-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-10">
          {item?.menuItems.map((subItem, index) => (
         
   
            console.log(subItem)
            return
           ( 
            <Link
              href={subItem.href}
              key={index}
              className={`block px-4 py-2 text-sm capitalize text-gray-700 from-[#13AAE0] to-[#18D89D] hover:bg-gradient-to-r hover:text-white ${
                currentRoute === subItem.href ? 'bg-gradient-to-r text-white' : ''
              }`}
            >
              {subItem.label}
            </Link>
          
          ))}
        </div>
      )} */}

      {/* {isOpen && item?.menuItems && (
        <div className="py-2 w-48 rounded-md text-white ease-in-out duration-300">
          {item.menuItems.map((subItem, index) => {

            if (isUserRole?.role?.role == "store_manager" && subItem.label === 'Managers') {
              return null;
            }
            return (
              <Link
                href={subItem.href}
                key={index}
                className={`block px-4 py-2 text-sm capitalize text-[#fff] from-[#7DE143] to-[#055938] hover:bg-gradient-to-r hover:text-white ${currentRoute === subItem.href ? 'bg-gradient-to-r text-white' : ''
                  }`}
              >
                {subItem.label}
              </Link>
            );
          })}
        </div>
      )} */}
      {item?.menuItems && (
        <div
          className={`ml-3 w-48 rounded-md text-white transition-all duration-500 ease-in-out ${
            isOpen
              ? "max-h-screen opacity-100 visible"
              : "max-h-0 opacity-0 invisible"
          } overflow-hidden`}
        >
          {item.menuItems.map((subItem, index) => {
            if (
              isUserRole?.role?.role === "store_manager" &&
              subItem.label === "Managers"
            ) {
              // Don't render this menu item for managers
              return null;
            }

            if (
              ifPagePermission(mySubscription, subItem?.sname || null) == false
            ) {
              return null;
            }
            return (
              <Link
                href={subItem.href}
                key={index} // Consider using a unique identifier instead of index
                className={`block mt-1 text-[14px] px-4 py-2 whitespace-nowrap text-sm capitalize text-[#fff] from-[#7DE143] to-[#055938] hover:bg-[#7DE143] rounded-md hover:text-white ${
                  currentRoute === subItem.href
                    ? "bg-gradient-to-r text-white"
                    : ""
                }`}
              >
                {subItem.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
