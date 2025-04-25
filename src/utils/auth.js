"use client";

const isAuthenticated = () => {
  if (typeof window !== "undefined") {
    let user = localStorage?.getItem("user");
    user = user === undefined ? "" : JSON.parse(user);
    if (user && user.token) {
      return true;
    } else {
      return false;
    }
  }
};

export default isAuthenticated;
