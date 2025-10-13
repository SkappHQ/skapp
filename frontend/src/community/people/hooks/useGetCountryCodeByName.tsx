import { countryCodeList } from "../data/countryCodes";

const useGetCountryCodeByName = (country: string) => {
  const matchedCountry = countryCodeList.find(
    (item) => country && item.name.toLowerCase() === country.toLowerCase()
  );
  return matchedCountry ? matchedCountry.code : "";
};
export default useGetCountryCodeByName;
