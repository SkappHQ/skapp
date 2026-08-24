import { Avatar } from "@rootcodelabs/skapp-ui";
import { FC, useId } from "react";

import {
  EmployeeAvatarData,
  getEmployeeAvatarName
} from "~community/common/components/atoms/EmployeeAvatarChip/EmployeeAvatarChip";
import useGetImageUrl from "~community/common/hooks/useGetImageUrl";

export interface EmployeeGroupAvatarProps {
  employee: EmployeeAvatarData;
}

const EmployeeGroupAvatar: FC<EmployeeGroupAvatarProps> = ({ employee }) => {
  // Keeps the avatar id unique when the same employee is rendered more than
  // once at a time (e.g. in a select trigger and in its option list).
  const instanceId = useId();
  const imageUrl = useGetImageUrl(employee.authPic ?? "");
  const employeeName = getEmployeeAvatarName(employee);

  return (
    <Avatar
      id={`${instanceId}-avatar-${employee.employeeId}`}
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
