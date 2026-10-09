import { AvatarChip, AvatarSize } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { EmployeeAvatarData } from "~community/common/types/CommonTypes";
import { getEmployeeAvatarName } from "~community/common/utils/commonUtil";

export interface EmployeeAvatarChipProps {
  employee: EmployeeAvatarData;
  className?: string;
  size?: AvatarSize;
}

const EmployeeAvatarChip: FC<EmployeeAvatarChipProps> = ({
  employee,
  className,
  size = "sm"
}) => {
  const { imageUrl } = useGetImageUrl({ src: employee.authPic ?? "" });
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
          size
        }}
        label={employeeName}
      />
    </div>
  );
};

export default EmployeeAvatarChip;
