import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "./context/auth";

// Define the protected routes for each role
const protectedRoutes = {
  admin: [
    "/admin/dashboard",
    "/admin/user/register",
    "/admin/user/management/backoffice",
    "/admin/user/management/players",
    "/notify"
  ],
  eventmgr: [
    "/event",
    "/event/venue",
    "/event/fights",
    "/event/transaction_history",
  ],
  finance: [
    "/finance/dashboard",
    "/finance/reports",
  ],
  acctmgr: [
    "/master/dashboard",
    "/master/agent-list",
    "/dashboard",
    "/players",
    "/loading-station",
    "/history/transfer",
  ],
};

// Middleware to handle role-based validation
const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const currentSession = await getCurrentSession();

  // If no session exists, redirect to login
  if (!currentSession) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Check if user has access to the requested route based on their role
  const userRoles = currentSession.roles;
  let hasAccess = false;

  // Loop through the user roles and check if they have access to the current route
  for (const role of userRoles) {
    console.log(role)
    if (protectedRoutes[role as keyof typeof protectedRoutes]?.some((route: string) => pathname.startsWith(route))) {
      hasAccess = true;
      break;
    }
  }

  // If the user does not have access, redirect to the appropriate dashboard
  if (!hasAccess) {
    // Redirect users based on roles
    if (userRoles.includes("admin")) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.nextUrl));
    } else if (userRoles.includes("acctmgr")) {
      if (currentSession.accountType === 3) {
        return NextResponse.redirect(new URL("/master/dashboard", request.nextUrl));
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
      }
    } else if (userRoles.includes("finance")) {
      return NextResponse.redirect(new URL("/finance/dashboard", request.nextUrl));
    } else if (userRoles.includes("eventmgr")) {
      if (currentSession.accountType == 5)
        return NextResponse.redirect(new URL("/declarator", request.nextUrl));
      return NextResponse.redirect(new URL("/event", request.nextUrl));
    } else {
      // Default redirect for unknown roles
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
  }

  // Allow the request to continue if the user has access
  return NextResponse.next();
};

// Configuration to define which routes are protected
export const config = {
  matcher: [
    "/dashboard",
    "/history/:path*",
    "/players/:path*",
    "/loading-station/:path*",
    "/admin/:path*",
    "/finance/:path*",
    "/master/:path*",
    "/event/:path*",
  ],
};

export default middleware;
