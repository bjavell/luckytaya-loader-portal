import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "./context/auth";

const protectedRoutes = [
  "/dashboard",
  "/history",
  "/players",
  "/loading-station",
];
const protectedEventRoutes = [
  "/event",
  "/history",
  "/players",
  "/loading-station",
];
const publicRoutes = ["/login"];

const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const currentSession = await getCurrentSession();

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  const isEventRoute = protectedEventRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  if ((isEventRoute || isProtectedRoute) && !currentSession) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  const validRoutes = protectedRoutes.concat(publicRoutes);

  let isValidRoutes = validRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  if (pathname.startsWith("/players")) {
    isValidRoutes = false;
  }
  if (pathname.startsWith("/dashboard")) {
    if (currentSession.roles.includes("eventmgr")) {
      return NextResponse.redirect(new URL("/event", request.nextUrl));
    }
  }
  if (!isValidRoutes) {
    if (currentSession) {
      if (currentSession.roles.includes("eventmgr")) {
        return NextResponse.redirect(new URL("/event", request.nextUrl));
      }
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }

    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/dashboard",
    "/history/:path*",
    "/players/:path*",
    "/loading-station/:path*",
  ],
};

export default middleware;
