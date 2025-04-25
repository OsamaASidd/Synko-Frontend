"use client";

import { GlobalContext } from "@/context";
import { useContext, useState } from "react";

export default function OfflineChecker() {
  const { isOnline } = useContext(GlobalContext);
  return (
    <div
      className={`${
        !isOnline ? "block" : "hidden"
      } p-2 text-center bg-[red] text-[white] absolute top-0 w-[100%] left-0 right-0 z-50`}
    >
      No internet. Reconnect to keep it online.
    </div>
  );
}
