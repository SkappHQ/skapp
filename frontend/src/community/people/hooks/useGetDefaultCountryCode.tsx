import { useCommonStore } from "~community/common/stores/commonStore";

import { countryCodeList } from "../data/countryCodes";

const useGetDefaultCountryCode = () => {
  const { country } = useCommonStore((state) => state);

  const getCountryCode = () => {
    if (country) {
      const matchedCountry = countryCodeList.find(
        (item) => item.name.toLowerCase() === country.toLowerCase()
      );
      return matchedCountry ? matchedCountry.code : "94";
    }
    return "94";
  };

  return getCountryCode();
};
export default useGetDefaultCountryCode;
