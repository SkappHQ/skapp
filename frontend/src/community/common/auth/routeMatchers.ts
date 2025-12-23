// Define the matcher patterns for protected routes
export const routeMatchers = [
  // All community routes
  "/community/:path*",
  // Super admin routes
  "/setup-organization/:path*",
  "/module-selection",
  "/payment",
  // Common routes
  "/dashboard/:path*",
  "/configurations/:path*",
  "/settings/:path*",
  "/notifications",
  "/account",
  "/reset-password",
  "/unauthorized",
  "/verify/email",
  "/verify/success",
  // Module routes
  "/leave/:path*",
  "/people/:path*",
  "/timesheet/:path*",
  "/remove-people",
  "/integrations",
  "/subscription",
  "/user-account",
  // Sign routes
  "/sign",
  "/sign/contacts/:path*",
  "/sign/create/:path*",
  "/sign/folders/:path*",
  "/sign/inbox/:path*",
  "/sign/sent/:path*",
  "/sign/complete/:path*",
  // Project routes
  "/projects/:path*",
  // Invoice routes
  "/invoice",
  "/invoice/:path*",
  "/invoice/create/:path*"
];

export const config = {
  matcher: routeMatchers
};
