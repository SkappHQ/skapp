import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { concatStrings } from "~community/common/utils/commonUtil";

export interface EmployeeAvatarData {
  employeeId: number;
  firstName: string;
  lastName: string;
  authPic?: string;
}

export interface EmployeeAvatarChipProps {
  employee: EmployeeAvatarData;
  /** Namespaces the avatar DOM id so the same employee can be rendered in more
   * than one place (e.g. a select trigger and its option list) without clashing. */
  idPrefix?: string;
  className?: string;
}

export const getEmployeeAvatarName = (employee: EmployeeAvatarData): string =>
  concatStrings([employee.firstName, employee.lastName]).trim();

const EmployeeAvatarChip: FC<EmployeeAvatarChipProps> = ({
  employee,
  idPrefix = "avatar",
  className
}) => {
  const imageUrl = useGetImageUrl(employee.authPic ?? "");
  const employeeName = getEmployeeAvatarName(employee);

  return (
    <div className={className}>
      <AvatarChip
        avatarProps={{
          id: `${idPrefix}-${employee.employeeId}`,
          firstName: employee.firstName,
          lastName: employee.lastName,
          src: imageUrl ?? "",
          alt: employeeName,
          size: "sm"
        }}
        label={employeeName}
      />
    </div>
  );
};

export default EmployeeAvatarChip;
