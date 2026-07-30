export const isSafeOAuthAuthorizeCallback = (rawCallback: string): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const target = new URL(rawCallback, window.location.origin);
    return (
      target.origin === window.location.origin &&
      target.pathname.includes("/oauth2/authorize")
    );
  } catch {
    return false;
  }
};
