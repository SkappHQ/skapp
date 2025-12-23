import { useRouter } from "next/router";
import React, { useEffect } from "react";

import { useAuth } from "./AuthProvider";
import { validateRouteAccess } from "./routeGuards";

// HOC for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;

      // Check if user is authenticated
      if (!isAuthenticated) {
        const signinPath =
          process.env.NEXT_PUBLIC_MODE === "enterprise"
            ? `/enterprise/signin?redirect=${router.asPath}`
            : `/community/signin?redirect=${router.asPath}`;
        router.push(signinPath);
        return;
      }

      // Validate route access
      if (user) {
        validateRouteAccess(user, router.pathname, router);
      }
    }, [isAuthenticated, isLoading, user, router]);

    // Show loading state
    if (isLoading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh"
          }}
        >
          Loading...
        </div>
      );
    }

    // Prevent rendering if not authenticated
    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };

  return AuthenticatedComponent;
};
