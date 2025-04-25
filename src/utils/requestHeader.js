"use client";

import Cookies from "js-cookie";
import { TOKEN } from "./constants";

export default function requestHeader() {
  let user = Cookies.get(TOKEN);
  user = user === undefined ? "" : JSON.parse(user);
  if (user && user.token) {
    return {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + user.token,
    };
  }
  return {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
  };
}
