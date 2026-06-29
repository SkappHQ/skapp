import { Avatar } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { concatStrings } from "~community/common/utils/commonUtil";
import { CrmOwner } from "~community/crm/types/CommonTypes";

interface Props {
  owner: CrmOwner;
  label: string;
}

const TaskOwnerField: FC<Props> = ({ owner, label }) => {
  const ownerName = concatStrings([owner.firstName, owner.lastName ?? ""]);

  return (
    <div className="flex flex-1 items-center justify-between w-full">
      <span className="subtitle3 text-secondary-text whitespace-nowrap">
        {label}
      </span>
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <Avatar
            id={`task-owner-${owner.employeeId}`}
            size="xs"
            firstName={owner.firstName}
            lastName={owner.lastName ?? ""}
            src={owner.authPic ?? ""}
          />
          <span className="body2">{ownerName}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskOwnerField;
