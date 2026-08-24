export { default } from "next-auth/middleware";

export const config = {
  // Protect all routes inside the dashboard
  matcher: [
    "/dashboard",
    "/transfer",
    "/transactions",
    "/p2p",
    "/merchant-pay",
  ],
};
