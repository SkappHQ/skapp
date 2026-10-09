import { AvatarGroup, AvatarSize } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { EmployeeAvatarData } from "~community/common/types/CommonTypes";

export interface EmployeeAvatarGroupProps {
  employees: EmployeeAvatarData[];
  size?: AvatarSize;
}

const EmployeeAvatarGroup: FC<EmployeeAvatarGroupProps> = ({
  employees,
  size = "sm"
}) => {
  const { imageUrls } = useGetImageUrl({
    src: employees.map((employee) => employee.authPic ?? "")
  });

  return (
    <AvatarGroup
      avatars={employees.map((employee, index) => ({
        id: String(employee.employeeId),
        firstName: employee.firstName,
        lastName: employee.lastName,
        src: imageUrls[index],
        size
      }))}
    />
  );
};

export default EmployeeAvatarGroup;
