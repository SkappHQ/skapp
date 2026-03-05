import { useTheme } from "@mui/material";
import { useMemo } from "react";

import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { usePeopleStore } from "~community/people/store/store";

const SelectedFiltersSection = () => {
  const theme = useTheme();
  const translateText = useTranslator("peopleModule", "peoples.filters");
  const { employeeDataFilter } = usePeopleStore((state) => state);

  const getFilterCount = useMemo(() => {
    let count = 0;
    if (employeeDataFilter.gender) count += 1;
    count += employeeDataFilter.nationality.length;
    count += employeeDataFilter.employmentTypes.length;
    count += employeeDataFilter.employmentAllocations.length;
    count += employeeDataFilter.accountStatus.length;
    count += employeeDataFilter.role.length;
    count += employeeDataFilter.team.length;
    count += employeeDataFilter.permission.length;
    return count;
  }, [employeeDataFilter]);

  const getJobFamilyNames = useMemo(() => {
    return employeeDataFilter.role.map((jobFamily) => jobFamily.text);
  }, [employeeDataFilter.role]);

  const getTeamNames = useMemo(() => {
    return employeeDataFilter.team.map((team) => team.text);
  }, [employeeDataFilter.team]);

  const getTranslation = (term: string) => {
    return translateText([`selectedFiltersFilterItems.${term.toLowerCase()}`]);
  };

  const renderIconChip = (label: string) => (
    <div>
      <IconChip
        label={
          !getTranslation(label).includes("peopleModule")
            ? getTranslation(label)
            : label
        }
        chipStyles={{
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.primary.dark,
          padding: "8px 12px",
          border: `1px solid ${theme.palette.primary.dark}`
        }}
      />
    </div>
  );

  const renderSection = (title: string, items: string[]) => {
    if (!items.length) return null;

    return (
      <div className="mb-4 flex flex-col gap-2">
        <p className="subtitle4 text-secondary-text">
          {translateText([title])}
        </p>
        <div className="flex flex-row space-x-1 gap-2 flex-wrap">
          {items.map(renderIconChip)}
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 flex flex-col overflow-y-auto">
      {getFilterCount > 0 ? (
        <>
          <p className="mb-4 body2 text-secondary-text">
            {translateText(["selectedFilters"], { count: getFilterCount })}
          </p>

          {renderSection("demographics", [
            ...(employeeDataFilter.gender ? [employeeDataFilter.gender] : []),
            ...employeeDataFilter.nationality
          ])}

          {renderSection("employements", [
            ...employeeDataFilter.employmentTypes,
            ...employeeDataFilter.employmentAllocations,
            ...employeeDataFilter.accountStatus
          ])}

          {renderSection("jobFamilies", getJobFamilyNames as string[])}
          {renderSection("teams", getTeamNames as string[])}

          {renderSection(
            "userRoles",
            employeeDataFilter.permission as string[]
          )}
        </>
      ) : (
        <p className="text-sm font-semibold mb-4">
          {translateText(["noFIlters"])}
        </p>
      )}
    </div>
  );
};

export default SelectedFiltersSection;
