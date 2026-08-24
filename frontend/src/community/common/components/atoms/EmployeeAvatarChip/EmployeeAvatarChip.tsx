import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { FC, useId } from "react";

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
  className?: string;
}

export const getEmployeeAvatarName = (employee: EmployeeAvatarData): string =>
  concatStrings([employee.firstName, employee.lastName]).trim();

const EmployeeAvatarChip: FC<EmployeeAvatarChipProps> = ({
  employee,
  className
}) => {

  const instanceId = useId();
  const imageUrl = useGetImageUrl(employee.authPic ?? "");
  const employeeName = getEmployeeAvatarName(employee);

  return (
    <div className={className}>
      <AvatarChip
        avatarProps={{
          id: `${instanceId}-avatar-${employee.employeeId}`,
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
