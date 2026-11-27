import useSessionData from "~community/common/hooks/useSessionData";

const useCanSetJoinDate = (): boolean => {
  const { isSuperAdmin, isPeopleAdmin } = useSessionData();

  return Boolean(isSuperAdmin || isPeopleAdmin);
};

export default useCanSetJoinDate;
