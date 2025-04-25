"use client";

import socketConnection from "@/utils/socket.io";
import { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { MERCHANT, TOKEN, USERTOKEN } from "@/utils/constants";
import { getRequest } from "@/utils/apiFunctions";

export const GlobalContext = createContext(null);

export default function GlobalState({ children }) {
  const [pageLevelLoader, setPageLevelLoader] = useState(true);
  const [componentLevelLoader, setComponentLevelLoader] = useState({
    loading: false,
    id: "",
  });
  const [isAuthUser, setIsAuthUser] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [merchant, setMerchant] = useState({});
  const [socket, setSocket] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [mySubscription, setMySubscription] = useState(null);

  useEffect(() => {
    window?.addEventListener("beforeunload", () => {
      socket?.close();
      socket?.disconnect();
    });
  }, [socket]);

  useEffect(() => {
    setSocket(socketConnection);
    return () => {
      socket?.close();
      socket?.disconnect();
      setSocket(null);
    };
  }, []);

  useEffect(() => {
    let session = Cookies.get(TOKEN);
    session = session === undefined ? "" : JSON.parse(session);
    if (session && session.token) {
      setIsAuthUser(true);
      const userData = JSON.parse(localStorage.getItem(USERTOKEN)) || {};
      setUser(userData?.user);
      setProfile(userData?.profile);
      setUserRole(userData?.user_role);
      try {
        const merchant = JSON.parse(localStorage.getItem(MERCHANT));
        setMerchant(merchant);
      } catch (error) {
        // Handle the error here.
        setMerchant({});
      }
    } else {
      setIsAuthUser(false);
      setUser(null); //unauthenticated user
      setMerchant({});
    }
  }, []);

  const getMySubscription = () => {
    getRequest(`/get-my-subscription`).then((res) => {
      setMySubscription(res?.data);
    });
  };
  useEffect(() => {
    getMySubscription();
  }, [user]);

  function handleOnlineStatusChange() {
    if (!navigator.onLine) {
      setIsOnline(navigator.onLine);
    } else {
      setIsOnline(navigator.onLine);
    }
  }
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for the client-side
      window.addEventListener("online", handleOnlineStatusChange);
      window.addEventListener("offline", handleOnlineStatusChange);

      return () => {
        window.removeEventListener("online", handleOnlineStatusChange);
        window.removeEventListener("offline", handleOnlineStatusChange);
      };
    }
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        pageLevelLoader,
        setPageLevelLoader,
        componentLevelLoader,
        setComponentLevelLoader,
        isAuthUser,
        setIsAuthUser,
        user,
        setUser,
        profile,
        setProfile,
        userRole,
        setUserRole,
        merchant,
        setMerchant,
        socket,
        setSocket,
        isOnline,
        setMySubscription,
        mySubscription,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
