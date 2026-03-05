import { useTheme } from "@mui/material";
import { RefObject, SyntheticEvent } from "react";

import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import DropdownAutocomplete from "~community/common/components/molecules/DropdownAutocomplete/DropdownAutocomplete";
import { useMediaQuery } from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { DropdownListType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { usePeopleStore } from "~community/people/store/store";
import { GenderTypes } from "~community/people/types/AddNewResourceTypes";

import { NationalityList } from "../../../utils/data/employeeSetupStaticData";

const DemographicsSection = ({
  selected,
  basicChipRef
}: {
  selected: string;
  basicChipRef: RefObject<{ [key: string]: HTMLDivElement | null }>;
}) => {
  const theme = useTheme();

  const queryMatches = useMediaQuery();
  const isSmallScreen = queryMatches(`(max-width: 1150px)`);

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
    <div className="overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h1 className="subtitle3">Gender</h1>
        <div className="flex flex-row gap-3">
          {genderFilters.map((genderItem, index) => (
            <BasicChip
              ref={(el: HTMLDivElement | null) => {
                if (el && basicChipRef.current) {
                  basicChipRef.current[selected + index] = el;
                }
              }}
              key={index}
              label={genderItem.label}
              onClick={() => {
                if (
                  employeeDataFilter.gender &&
                  employeeDataFilter.gender === genderItem.value
                )
                  removeGenderFilter();
                else setEmployeeDataFilter("gender", genderItem.value);
              }}
              chipStyles={{
                display: "flex",
                textAlign: "left",
                backgroundColor:
                  employeeDataFilter.gender === genderItem.value
                    ? theme.palette.secondary.main
                    : theme.palette.grey[100],
                color:
                  employeeDataFilter.gender === genderItem.value
                    ? theme.palette.primary.dark
                    : "black",
                padding: "8px 12px",
                borderRadius: 5,
                marginBottom: 2,
                fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                border:
                  employeeDataFilter.gender === genderItem.value
                    ? `1px solid ${theme.palette.secondary.dark}`
                    : "none"
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-col">
          <DropdownAutocomplete
            itemList={NationalityList}
            inputName="nationalty"
            label={"Nationality"}
            placeholder={"Nationality"}
            onChange={handleSetNationality}
            value={undefined}
            componentStyle={{
              mt: "0rem",
              width: "100%"
            }}
            labelStyles={{
              fontSize: isSmallScreen ? "0.75rem" : "0.875rem"
            }}
          />

          <div className="flex flex-row mt-4 gap-1 flex-wrap max-w-[250px]">
            {employeeDataFilter?.nationality &&
              employeeDataFilter?.nationality.length > 0 &&
              employeeDataFilter?.nationality.map((nationality, index) => (
                <div key={index}>
                  <IconChip
                    label={nationality}
                    icon={
                      <Icon
                        name={IconName.SELECTED_ICON}
                        fill={theme.palette.primary.dark}
                      />
                    }
                    chipStyles={{
                      backgroundColor: theme.palette.secondary.main,
                      color: theme.palette.primary.dark,
                      padding: "8px 12px",
                      border: `1px solid ${theme.palette.secondary.dark}`
                    }}
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
