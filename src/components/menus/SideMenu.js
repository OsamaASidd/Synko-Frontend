"use client";
import { GlobalContext } from "@/context";
import React, { useState, useContext, useEffect } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { postRequest } from "@/utils/apiFunctions";
import DropdownMenu from "./DropdownMenu";
import { MERCHANT, TOKEN, USERTOKEN } from "@/utils/constants";
import Mainlogo from "../../../public/svg/Mainlogo";
import { ifPagePermission } from "@/utils/helper";
const SideMenu = () => {
  //   let userData = JSON.parse(localStorage.getItem("user"))
  //   let userRole=userData.user_role.role.role
  //   console.log("userRole",userRole)
  //   if (typeof window !== "undefined") {
  //      TeamID = localStorage.getItem("myData");
  //  }

  const {
    setIsAuthUser,
    setMerchant,
    user,
    merchant,
    setUser,
    setProfile,
    userRole,
    setUserRole,
    mySubscription,
  } = useContext(GlobalContext);
  console.log("Subscription");
  console.log(mySubscription);
  const [isUserRole, setIsUserRole] = useState();
  useEffect(() => {
    if (userRole) {
      setIsUserRole(userRole);
    }
  }, [userRole, merchant]);

  const router = useRouter();
  const currentRoute = usePathname();
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

  const [show, setShow] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 1280) {
          setShow(false);
        } else {
          setShow(true);
        }
      }
    };

    if (typeof window !== "undefined") {
      // Add an event listener for the window resize event
      window.addEventListener("resize", handleResize);

      // Call handleResize immediately to set the initial state
      handleResize();
    }

    // Remove the event listener when the component unmounts
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  // Managertab = ()?{}:""
  const dropdownMenus = [
    {
      name: "home",
      label: "Home",
      iconSrc: "/images/home.png",
      href: "/dashboard",
    },
    {
      name: "",
      label: "Merchants",
      iconSrc: "/images/mer.png",
      href: "/manage/merchants",
    },
    {
      name: "menu-items",
      label: "Items",
      iconSrc: "/images/item.png",
      menuItems: [
        { label: "Categories", href: "/manage/categories" },
        { label: "Items", href: "/manage/items" },
        {
          label: "Modifiers",
          href: "/manage/modifiers",
          sname: "item_modifiers",
        },
      ],
    },
    {
      name: "tables",
      label: "Tables",
      iconSrc: "/images/mana.png",
      href: "/manage/tables",
      sname: "tables",
    },
    {
      name: "orders",
      label: "Orders",
      iconSrc: "/images/order.png",
      href: "/manage/orders",
    },
    {
      name: "reports",
      label: "Reports",
      iconSrc: "/images/reports.png",
      href: "/reports",
      sname: "report",
      menuItems: [
        { label: "Reports", href: "/sales/reports" },
        {
          label: "Employee Attendance",
          href: "/employees/attendance",
          sname: "employee_attendance",
        },
        { label: "Analytics", href: "/reports/analytics" },
      ],
    },
    {
      name: "partners",
      label: "Partners",
      iconSrc: "/images/partners.png",
      href: "/manage/partners",
    },
    {
      name: "timings",
      label: "Timing",
      iconSrc: "/images/timing.png",
      href: "/manage/timing",
    },
    {
      name: "devices",
      label: "Devices",
      iconSrc: "/images/device.png",
      href: "/manage/devices",
    },
    {
      name: "teams",
      label: "Teams",
      iconSrc: "/images/teams.png",
      menuItems: [
        // { label: "Roles", href: "#" },
        {
          label: "Employees",
          href: "/manage/teams",
          sname: "employee_creation",
        },
        { label: "Managers", href: "/manage/manager" },
      ],
    },
    {
      label: "Customers",
      iconSrc: "/images/customers.png",
      href: "/manage/customers",
    },
    {
      label: "Reservations",
      iconSrc: "/images/customers.png",
      href: "/manage/reservations",
    },
    {
      name: "onlines",
      label: "Online",
      iconSrc: "/images/site.png",
      href: "/manage/online/site",
      sname: "online_store_access",
    },
    {
      name: "discounts",
      label: "Discounts",
      iconSrc: "/images/discounts.png",
      href: "/manage/discounts",
    },
    {
      name: "inventories",
      label: "Inventory",
      iconSrc: "/images/inventory.png",
      href: "/manage/inventory",
      sname: "inventory_management",
    },
    {
      name: "",
      label: "Settings",
      iconSrc: "/images/settings.png",
      menuItems: [
        // { label: "Roles", href: "#" },
        { label: "Account & Settings", href: "/settings" },
        { label: "Pricing & Subscriptions", href: "/manage/subscription" },
        { label: "App Integrations", href: "/manage/my-applications" },
        { label: "Role Management", href: "/manage/roles" },
      ],
    },
  ];

  return (
    <>
      <div
        className={`${
          show == true ? "hidden" : "block"
        } transition-all text-white w-[70px] bg-[#171821] rounded-r-full py-1 flex items-center justify-end pr-3 absolute z-20 top-8 left-0 xl:hidden cursor-pointer duration-100 ease-in-out`}
      >
        <GiHamburgerMenu size="25" onClick={() => setShow(!show)} />
      </div>
      <div
        className={`bg-[#171821] h-screen max-xl:overflow-y-auto xl:!w-[20%] xl:py-3 xl:px-5 flex flex-col items-center space-y-3 xl:!sticky duration-300 fixed z-20 top-0 pb-[20px] ${
          show == true
            ? "w-[100%] sm:w-[100%] md:w-[50%] lg:w-[25%] px-5"
            : "w-0"
        }`}
      >
        <div
          className={`bg-[#171821] relative z-10 flex xl:hidden cursor-pointer pt-5 pb-3 text-white items-center justify-end duration-300`}
        >
          <GiHamburgerMenu size="25" onClick={() => setShow(!show)} />
        </div>
        <Link
          href="/"
          className={`bg-[#2F353E] rounded-[8px] w-[100%] py-2.5 flex pl-6  ${
            show == true ? "flex" : "hidden"
          }`}
        >
          <Mainlogo width={120} height={36} textColor={"#fff"} />
        </Link>

        <div
          className={`bg-[#2F353E] rounded-[12px] h-[calc(100vh-171.5px)] overflow-y-auto w-[100%] px-5 py-3 space-y-2 flex-col text-white ${
            show == true ? "flex" : "hidden"
          }`}
        >
          {dropdownMenus.map((menu, index) => {
            if (
              userRole?.role?.role !== "owner" &&
              menu.name !== null &&
              menu.name !== "home"
            ) {
              if (
                !userRole?.role?.role_permissions.some(
                  (val) => val?.default_permission?.permission == menu?.name
                )
              ) {
                return null;
              }
            }

            if (
              ifPagePermission(mySubscription, menu?.sname || null) == false
            ) {
              return null;
            }

            return (
              <DropdownMenu
                key={index}
                item={menu}
                currentRoute={currentRoute}
                isUserRole={isUserRole}
                mySubscription={mySubscription}
              />
            );
          })}
        </div>

        <button
          onClick={() => handleLogout()}
          className={`bg-[#2F353E] text-white text-[14px] rounded-[8px] w-[100%] py-[10px] flex justify-center  ${
            show == true ? "flex" : "hidden"
          }`}
        >
          <div className="flex items-center space-x-5">
            <div>
              <img src="/images/Logout1.png" alt="" className="w-[22px]" />
            </div>
            <div className="text-[14px]">Log out</div>
          </div>
        </button>
      </div>
    </>
  );
};

export default SideMenu;
