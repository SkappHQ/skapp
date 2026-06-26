interface UserLimitStore {
  setShowUserLimitBanner: (value: boolean) => void;
  showUserLimitBanner: boolean;
  setIsUserLimitExceeded: (value: boolean) => void;
}

export const useUserLimitStore = (
  arg0: (state: any) => any
): UserLimitStore => {
  return {
    setShowUserLimitBanner: () => {},
    showUserLimitBanner: false,
    setIsUserLimitExceeded: () => {}
  };
};
