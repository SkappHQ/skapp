import { countryCodeList } from "../data/countryCodes";

const useGetCountryCodeByName = (country: string) => {
  if (country) {
    const matchedCountry = countryCodeList.find(
      (item) => item.name.toLowerCase() === country.toLowerCase()
    );
    return matchedCountry ? matchedCountry.code : "";
  }
  return "";
};
export default useGetCountryCodeByName;
