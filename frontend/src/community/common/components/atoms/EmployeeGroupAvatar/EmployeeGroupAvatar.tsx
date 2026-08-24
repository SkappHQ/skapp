import { Avatar } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import {
  EmployeeAvatarData,
  getEmployeeAvatarName
} from "~community/common/components/atoms/EmployeeAvatarChip/EmployeeAvatarChip";
import useGetImageUrl from "~community/common/hooks/useGetImageUrl";

export interface EmployeeGroupAvatarProps {
  employee: EmployeeAvatarData;
}

const EmployeeGroupAvatar: FC<EmployeeGroupAvatarProps> = ({ employee }) => {
  const imageUrl = useGetImageUrl(employee.authPic ?? "");
  const employeeName = getEmployeeAvatarName(employee);

  return (
    <Avatar
      id={`avatar-${employee.employeeId}`}
      firstName={employee.firstName}
      lastName={employee.lastName}
      src={imageUrl ?? ""}
      alt={employeeName}
      title={employeeName}
      size="sm"
    />
  );
};

export default EmployeeGroupAvatar;
