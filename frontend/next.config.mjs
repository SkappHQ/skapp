/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    const isEnterpriseMode = process.env.NEXT_PUBLIC_MODE === "enterprise";
    return [
      {
        source: "/welcome",
        destination: "/community/welcome"
      },
      {
        source: "/signup",
        destination: isEnterpriseMode
          ? "/enterprise/signup"
          : "/community/signup"
      },
      {
        source: "/setup-organization",
        destination: isEnterpriseMode
          ? "/enterprise/setup-organization"
          : "/community/setup-organization"
      },
      {
        source: "/module-selection",
        destination: "/enterprise/module-selection"
      },
      {
        source: "/dashboard",
        destination: "/community/dashboard"
      },
      {
        source: "/dashboard/attendance/clock-in-summary",
        destination: "/community/dashboard/attendance/clock-in-summary"
      },
      {
        source: "/dashboard/attendance/late-arrivals-summary",
        destination: "/community/dashboard/attendance/late-arrivals-summary"
      },
      {
        source: "/dashboard/leave/resource-availability",
        destination: "/community/dashboard/leave/resource-availability"
      },
      {
        source: "/signin",
        destination: isEnterpriseMode
          ? "/enterprise/signin"
          : "/community/signin"
      },
      {
        source: "/settings/account",
        destination: isEnterpriseMode
          ? "/enterprise/settings/account"
          : "/community/settings/account"
      },
      {
        source: "/settings/billing",
        destination: "/enterprise/settings/billing"
      },
      {
        source: "/notifications",
        destination: "/community/notifications"
      },
      {
        source: "/account",
        destination: "/community/account"
      },
      {
        source: "/unauthorized",
        destination: "/community/unauthorized"
      },
      {
        source: "/timesheet/my-timesheet",
        destination: "/community/timesheet/my-timesheet"
      },
      {
        source: "/timesheet/all-timesheets",
        destination: "/community/timesheet/all-timesheets"
      },
      {
        source: "/timesheet/timesheet-requests",
        destination: "/community/timesheet/timesheet-requests"
      },
      {
        source: "/reset-password",
        destination: isEnterpriseMode
          ? "/enterprise/reset-password"
          : "/community/reset-password"
      },
      {
        source: "/leave/leave-analytics",
        destination: "/community/leave/leave-analytics"
      },
      {
        source: "/people/directory",
        destination: isEnterpriseMode
          ? "/enterprise/people/directory"
          : "/community/people/directory"
      },
      {
        source: "/people/job-family",
        destination: "/community/people/job-family"
      },
      {
        source: "/people/teams",
        destination: "/community/people/teams"
      },
      {
        source: "/people/holidays",
        destination: "/community/people/holidays"
      },
      {
        source: "/people/directory/add-new-resource",
        destination: "/community/people/directory/add-new-resource"
      },
      {
        source: "/people/directory/pending",
        destination: "/community/people/directory/pending"
      },
      {
        source: "/people/directory/edit-all-information/:id",
        destination: "/community/people/directory/edit-all-information/:id"
      },
      {
        source: "/leave/my-requests",
        destination: "/community/leave/my-requests"
      },
      {
        source: "/leave/leave-requests",
        destination: "/community/leave/leave-requests"
      },
      {
        source: "/leave/types",
        destination: "/community/leave/types"
      },
      {
        source: "/leave/types/add-edit",
        destination: "/community/leave/types/add-edit"
      },
      {
        source: "/leave/leave-entitlements",
        destination: "/community/leave/leave-entitlements"
      },
      {
        source: "/leave/types/add",
        destination: "/community/leave/types/add"
      },
      {
        source: "/leave/types/edit",
        destination: "/community/leave/types/edit"
      },
      {
        source: "/leave/entitlements/leave-entitlements",
        destination: "/community/leave/entitlements/leave-entitlements"
      },
      {
        source: "/leave/pending-leave",
        destination: "/community/leave/pending-leave"
      },
      {
        source: "/leave/analytics/:id",
        destination: "/community/leave/analytics/:id"
      },
      {
        source: "/timesheet/analytics/:id",
        destination: "/community/timesheet/analytics/:id"
      },
      {
        source: "/leave/carry-forward-balances",
        destination: "/community/leave/entitlements/carry-forward-balances"
      },
      {
        source: "/leave/analytics/reports",
        destination: "/community/leave/analytics/reports"
      },
      {
        source: "/configurations/attendance",
        destination: "/community/configurations/attendance"
      },
      {
        source: "/configurations/time",
        destination: "/community/configurations/time"
      },
      {
        source: "/configurations/esign",
        destination: "/enterprise/configurations/esign"
      },
      {
        source: "/configurations/user-roles",
        destination: "/community/configurations/user-roles"
      },
      {
        source: "/configurations/invoice",
        destination: "/enterprise/configurations/invoice"
      },
      {
        source: "/configurations/user-roles/attendance",
        destination: "/community/configurations/user-roles/attendance"
      },
      {
        source: "/configurations/user-roles/leave",
        destination: "/community/configurations/user-roles/leave"
      },
      {
        source: "/configurations/user-roles/people",
        destination: "/community/configurations/user-roles/people"
      },
      {
        source: "/configurations/user-roles/esignature",
        destination: "/community/configurations/user-roles/esignature"
      },
      {
        source: "/leave/analytics/:id",
        destination: "/community/leave/analytics/:id"
      },
      {
        source: "/verify/email",
        destination: "/enterprise/verify/email"
      },
      {
        source: "/verify/success",
        destination: "/enterprise/verify/success"
      },
      {
        source: "/redirect",
        destination: "/enterprise/redirect"
      },
      {
        source: "/verify/guest-otp",
        destination: "/enterprise/verify/guest-otp"
      },
      {
        source: "/verify/guest",
        destination: "/enterprise/verify/guest"
      },
      {
        source: "/verify/guest",
        destination: "/enterprise/verify/guest"
      },
      {
        source: "/forget-password",
        destination: "/enterprise/forget-password"
      },
      {
        source: "/maintenance",
        destination: "/enterprise/maintenance"
      },
      {
        source: "/sign/inbox",
        destination: "/enterprise/sign/inbox"
      },
      {
        source: "/sign/inbox/envelope/:id",
        destination: "/enterprise/sign/inbox/envelope/:id"
      },
      {
        source: "/sign/sent",
        destination: "/enterprise/sign/sent"
      },
      {
        source: "/sign/sent/envelope/:id",
        destination: "/enterprise/sign/sent/envelope/:id"
      },
      {
        source: "/sign/contacts",
        destination: "/enterprise/sign/contacts"
      },
      {
        source: "/sign/folders",
        destination: "/enterprise/sign/folders"
      },
      {
        source: "/sign/create",
        destination: "/enterprise/sign/create"
      },
      {
        source: "/sign/sign",
        destination: "/enterprise/sign/sign"
      },
      {
        source: "/sign/review",
        destination: "/enterprise/sign/review"
      },
      {
        source: "/sign/info",
        destination: "/enterprise/sign/info"
      },
      {
        source: "/sign/document/access",
        destination: "/enterprise/sign/document/access"
      },
      {
        source: "/sign/complete",
        destination: "/enterprise/sign/complete"
      },
      {
        source: "/settings/modules",
        destination: "/enterprise/settings/modules"
      },
      {
        source: "/integrations",
        destination: "/enterprise/settings/account"
      },
      {
        source: "/settings/integrations",
        destination: "/enterprise/settings/integrations"
      },
      {
        source: "/remove-people",
        destination: "/enterprise/remove-people"
      },
      {
        source: "/change-supervisors",
        destination: "/enterprise/change-supervisors"
      },
      {
        source: "/payment",
        destination: "/enterprise/payment"
      },
      {
        source: "/system-update",
        destination: "/enterprise/system-update"
      },
      {
        source: "/subscription",
        destination: "/enterprise/subscription"
      },
      {
        source: "/people/directory/edit/:id",
        destination: "/community/people/directory/edit/:id"
      },
      {
        source: "/people/directory/add",
        destination: "/community/people/directory/add"
      },
      {
        source: "/people/individual/:id",
        destination: "/community/people/individual/:id"
      },
      {
        source: "/user-account",
        destination: "/community/user-account"
      },
      {
        source: "/projects/list",
        destination: "/enterprise/projects/list"
      },
      {
        source: "/projects/guests",
        destination: "/enterprise/projects/guests"
      },
      {
        source: "/invoice",
        destination: "/enterprise/invoice"
      },
      {
        source: "/invoice/allInvoices",
        destination: "/enterprise/invoice/allInvoices"
      },
      {
        source: "/invoice/customers",
        destination: "/enterprise/invoice/customers"
      },
      {
        source: "/invoice/create/:id",
        destination: "/enterprise/invoice/create/:id"
      },
      {
        source: "/invoice/creates/:id",
        destination: "/enterprise/invoice/creates/:id"
      },
      {
        source: "/invoice/customers/customer-details/:id",
        destination: "/enterprise/invoice/customers/customer-details/:id"
      },
      {
        source: "/invoice/view/:id",
        destination: "/enterprise/invoice/view/:id"
      },
      {
        source: "/invoice/customers/customer-details/projects/:id",
        destination: "/enterprise/invoice/customers/customer-details/projects/:id"
      },
      {
        source: "/app-link",
        destination: "/enterprise/app-link"
      }
    ];
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
