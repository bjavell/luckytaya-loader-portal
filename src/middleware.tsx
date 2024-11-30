import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "./context/auth";

const protectedRoutes = [
  "/dashboard",
  "/history",
  "/players",
  "/loading-station",
  "/admin",
  "/master"
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

  const isValidRoutes = validRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  
  if (currentSession && currentSession.accountType == 5) 
    return NextResponse.redirect(new URL("/declarator", request.nextUrl));
  if (pathname.startsWith("/dashboard")) {
    if (currentSession.roles.includes('admin') && currentSession.accountType === 9) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.nextUrl));
    } else if (currentSession.roles.includes('acctmgr') && currentSession.accountType === 3) {
      return NextResponse.redirect(new URL("/master/dashboard", request.nextUrl));
    } else if (currentSession.roles.includes("eventmgr")) {
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
