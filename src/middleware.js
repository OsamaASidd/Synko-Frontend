import { NextResponse } from "next/server";
import { TOKEN } from "./utils/constants";

// Array of protected routes
const protectedRoutes = [
  "/dashboard",
  "/manage",
  "/newsale",
  "/reports",
  "/kitchen",
  "/settings",
  "/sales",
  "/employees",
];

// Routes that authenticated users should not access
const nonProtectedRoutesForAuthenticatedUsers = [
  "/login",
  "/register",
  "/forgot_password",
  // Add any other routes as needed
];

export function middleware(request) {
  // const token = request.cookies.get(TOKEN);
  const token = "FAKE_TOKEN";
  const path = request.nextUrl.pathname;

  // Redirect authenticated users away from non-protected routes
  if (token && nonProtectedRoutesForAuthenticatedUsers.includes(path)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect certain routes for non-authenticated users
  if (!token && protectedRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
