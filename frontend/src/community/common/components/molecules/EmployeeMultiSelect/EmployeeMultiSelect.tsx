import { AvatarChipsInput, AvatarChipsInputResult } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { useEffect, useMemo, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetSearchedEmployees } from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";
import { useGetEmployeeData } from "~community/people/api/PeopleApi";
import { DataFilterEnums, EmploymentStatusTypes } from "~community/people/types/EmployeeTypes";
import { AllEmployeeDataType } from "~community/people/types/PeopleTypes";
import { WorkLocationFormValues } from "~community/configurations/types/WorkLocationTypes";

interface Props {
  formik: FormikProps<WorkLocationFormValues>;
}

const EmployeeMultiSelect = ({ formik }: Props) => {
  const translateText = useTranslator("configurations", "workLocation");
  const [searchText, setSearchText] = useState("");

  const { setEmployeeDataParams } = usePeopleStore((state) => state);

  useEffect(() => {
    setEmployeeDataParams(DataFilterEnums.ACCOUNT_STATUS, [
      EmploymentStatusTypes.ACTIVE,
      EmploymentStatusTypes.PENDING
    ]);
  }, [setEmployeeDataParams]);

  const { data: employeePages } = useGetEmployeeData();
  const { data: searchResults } = useGetSearchedEmployees(searchText);

  const allEmployees: AllEmployeeDataType[] = employeePages?.pages
    ?.flatMap((page: any) => page?.items ?? []) ?? [];

  const displayEmployees =
    searchText.length > 0 ? (searchResults ?? []) : allEmployees;

  const selectedIds: number[] = formik.values.employeeIds ?? [];
  const isAllSelected = formik.values.isAllEmployees;

  const selectedChips: AvatarChipsInputResult[] = useMemo(() => {
    if (isAllSelected) {
      return [{
        chipContent: {
          avatarProps: {
            firstName: "All",
            id: "avatar-all-employees",
            lastName: ""
          },
          label: translateText(["form.allEmployees"])
        },
        optionId: -1,
        type: "employee"
      }];
    }
    return selectedIds
      .map((id) => {
        const emp = allEmployees.find((e) => Number(e.employeeId) === id);
        if (!emp) return null;
        return {
          chipContent: {
            avatarProps: {
              firstName: emp.firstName ?? "",
              id: `avatar-emp-${id}`,
              lastName: emp.lastName ?? "",
              image: emp.authPic ?? undefined
            },
            label: `${emp.firstName ?? ""} ${emp.lastName ?? ""}`
          },
          optionId: id,
          type: "employee"
        } as AvatarChipsInputResult;
      })
      .filter(Boolean) as AvatarChipsInputResult[];
  }, [isAllSelected, selectedIds, allEmployees, translateText]);

  const filteredResults: AvatarChipsInputResult[] = useMemo(() => {
    const allEmployeesOption: AvatarChipsInputResult = {
      chipContent: {
        avatarProps: {
          firstName: "All",
          id: "avatar-all-employees",
          lastName: ""
        },
        label: translateText(["form.allEmployees"])
      },
      optionId: -1,
      type: "employee"
    };

    const employeeOptions = displayEmployees
      .filter((emp) => !selectedIds.includes(Number(emp.employeeId)))
      .map((emp) => {
        const employee = emp as AllEmployeeDataType;
        return {
          chipContent: {
            avatarProps: {
              firstName: employee.firstName ?? "",
              id: `avatar-emp-${employee.employeeId}`,
              lastName: employee.lastName ?? "",
              image: employee.authPic ?? undefined
            },
            label: `${employee.firstName ?? ""} ${employee.lastName ?? ""}`
          },
          optionId: Number(employee.employeeId),
          type: "employee"
        };
      });

    if (!isAllSelected && !selectedIds.length) {
      return [allEmployeesOption, ...employeeOptions];
    }
    if (isAllSelected) return [];
    return employeeOptions;
  }, [displayEmployees, selectedIds, isAllSelected, translateText]);

  const handleChipSelect = (chip: AvatarChipsInputResult) => {
    if (chip.optionId === -1) {
      formik.setFieldValue("isAllEmployees", true);
      formik.setFieldValue("employeeIds", []);
    } else {
      formik.setFieldValue("employeeIds", [...selectedIds, chip.optionId as number]);
    }
  };

  const handleChipRemove = (chip: AvatarChipsInputResult) => {
    if (chip.optionId === -1) {
      formik.setFieldValue("isAllEmployees", false);
    } else {
      formik.setFieldValue(
        "employeeIds",
        selectedIds.filter((id) => id !== chip.optionId)
      );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold">
        {translateText(["form.assignEmployeesLabel"])}
      </p>
      <AvatarChipsInput
        ariaLabelClearButton={translateText(["form.employeeMultiSelect.ariaLabelClearButton"])}
        ariaLabelSearch={translateText(["form.employeeMultiSelect.ariaLabelSearch"])}
        ariaLabelSearchResults={translateText(["form.employeeMultiSelect.ariaLabelSearchResults"])}
        chipRemovedText={(label: string, count: number) =>
          `${label} ${translateText(["form.employeeMultiSelect.chipRemovedText"])}. ${count} ${count !== 1 ? translateText(["form.employeeMultiSelect.chipRemovedCountText"]) : translateText(["form.employeeMultiSelect.itemSelectedText"])}.`
        }
        chipSelectedText={(label: string, count: number) =>
          `${label} ${translateText(["form.employeeMultiSelect.chipSelectedText"])}. ${count} ${count !== 1 ? translateText(["form.employeeMultiSelect.chipSelectedCountText"]) : translateText(["form.employeeMultiSelect.itemSelectedText"])}.`
        }
        filteredResults={filteredResults}
        selectedChips={selectedChips}
        searchText={searchText}
        onChipSelect={handleChipSelect}
        onChipRemove={handleChipRemove}
        onSearchTextChange={setSearchText}
        instructionText={translateText(["form.employeeMultiSelect.instructionText"])}
        itemSelectedText={translateText(["form.employeeMultiSelect.itemSelectedText"])}
        noResultsText={translateText(["form.employeeMultiSelect.noResultsText"])}
        regionAriaLabel={translateText(["form.employeeMultiSelect.regionAriaLabel"])}
        resultCountText={(current: number, total: number) =>
          `${translateText(["form.employeeMultiSelect.resultCountText"])} ${current} ${translateText(["form.employeeMultiSelect.resultCountOfText"])} ${total} ${translateText(["form.employeeMultiSelect.resultCountResultsText"])}`
        }
        searchClearedText={translateText(["form.employeeMultiSelect.searchClearedText"])}
        searchPlaceholder={translateText(["form.assignEmployeesLabel"])}
        selectedSearchPlaceholder={translateText(["form.employeeMultiSelect.selectedSearchPlaceholder"])}
        showAvatars={true}
      />
    </div>
  );
};

export default EmployeeMultiSelect;
