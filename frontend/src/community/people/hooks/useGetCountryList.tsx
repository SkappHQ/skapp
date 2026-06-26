import { countryCodeList } from "../data/countryCodes";

const useGetCountryList = () => {
  const getCountryList = () => {
    return countryCodeList.map((item) => ({
      label: item.name,
      value: item.name
    }));
  };

  return getCountryList();
};

export default useGetCountryList;
