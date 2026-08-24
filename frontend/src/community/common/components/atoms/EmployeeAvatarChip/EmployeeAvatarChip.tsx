import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { EmployeeAvatarData } from "~community/common/types/CommonTypes";
import { getEmployeeAvatarName } from "~community/common/utils/commonUtil";

export interface EmployeeAvatarChipProps {
  employee: EmployeeAvatarData;
  className?: string;
}

const EmployeeAvatarChip: FC<EmployeeAvatarChipProps> = ({
  employee,
  className
}) => {
  const imageUrl = useGetImageUrl(employee.authPic ?? "");
  const employeeName = getEmployeeAvatarName(employee);

  return (
    <div className={className}>
      <AvatarChip
        avatarProps={{
          id: `avatar-${employee.employeeId}`,
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
