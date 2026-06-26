import { type DropdownListType } from "../types/CommonTypes";

export const handleMultipleSelectedValues = (
  values: Array<string | number>,
  itemList: DropdownListType[]
) => {
  const selectedValues: DropdownListType[] = [];

  values.forEach((valueItem) => {
    const selectedValueWithAllDetails = itemList.find(
      (itemListItem) => itemListItem.value === valueItem
    );
    if (selectedValueWithAllDetails) {
      selectedValues.push(selectedValueWithAllDetails);
    }
  });

  return selectedValues;
};
