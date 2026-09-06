import { Avatar } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { EmployeeAvatarData } from "~community/common/types/CommonTypes";
import { getEmployeeAvatarName } from "~community/common/utils/commonUtil";

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
