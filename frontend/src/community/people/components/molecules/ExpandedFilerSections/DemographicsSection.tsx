import { useTheme } from "@mui/material";
import { Chip, SelectableItemList } from "@rootcodelabs/skapp-ui";
import { RefObject, SyntheticEvent } from "react";

import DropdownAutocomplete from "~community/common/components/molecules/DropdownAutocomplete/DropdownAutocomplete";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { DropdownListType } from "~community/common/types/CommonTypes";
import { usePeopleStore } from "~community/people/store/store";
import { GenderTypes } from "~community/people/types/AddNewResourceTypes";

import { NationalityList } from "../../../utils/data/employeeSetupStaticData";

const DemographicsSection = ({
  basicChipRef
}: {
  selected: string;
  basicChipRef: RefObject<{ [key: string]: HTMLDivElement | null }>;
}) => {
  const theme = useTheme();

  const translateText = useTranslator(
    "peopleModule",
    "peoples.filters.demographicsFilters"
  );

  const { employeeDataFilter, setEmployeeDataFilter, removeGenderFilter } =
    usePeopleStore((state) => state);

  const genderFilters = [
    {
      label: translateText(["male"]),
      value: GenderTypes.MALE
    },
    {
      label: translateText(["female"]),
      value: GenderTypes.FEMALE
    },
    {
      label: translateText(["other"]),
      value: GenderTypes.OTHER
    }
  ];

  const handleSetNationality = (e: SyntheticEvent, value: DropdownListType) => {
    if (!employeeDataFilter.nationality.includes(value.value as string)) {
      setEmployeeDataFilter("nationality", [
        ...employeeDataFilter.nationality,
        value.value as string
      ]);
    }
  };

  return (
    <div className="overflow-y-auto flex flex-col gap-6">
      <SelectableItemList
        title={translateText(["gender"])}
        selectionMode="single"
        items={genderFilters}
        selectedValues={
          employeeDataFilter.gender ? [employeeDataFilter.gender] : []
        }
        onChipClick={(value) => {
          if (employeeDataFilter.gender === value) removeGenderFilter();
          else setEmployeeDataFilter("gender", value);
        }}
        chipRefs={basicChipRef}
      />

      <div>
        <div className="flex flex-col">
          <DropdownAutocomplete
            itemList={NationalityList}
            inputName="nationalty"
            label={translateText(["nationality"])}
            placeholder={translateText(["nationality"])}
            onChange={handleSetNationality}
            value={undefined}
            componentStyle={{
              mt: "0rem",
              width: "100%"
            }}
            labelStyles={theme.typography.subtitle3}
          />

          <div className="flex flex-row mt-4 gap-1 flex-wrap max-w-[250px]">
            {employeeDataFilter?.nationality &&
              employeeDataFilter?.nationality.length > 0 &&
              employeeDataFilter?.nationality.map((nationality, index) => (
                <div key={index}>
                  <Chip
                    label={nationality}
                    size="sm"
                    isSelected
                    onClick={() => {
                      setEmployeeDataFilter(
                        "nationality",
                        employeeDataFilter.nationality.filter(
                          (value) => value !== nationality
                        )
                      );
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicsSection;
