import { Avatar } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityOwner } from "~community/crm/activities/types/activityTypes";

interface ActivityOwnerAvatarProps {
  id: string;
  owner: ActivityOwner;
}

const ActivityOwnerAvatar: FC<ActivityOwnerAvatarProps> = ({ id, owner }) => {
  const translateAria = useTranslator("crmAria");
  const [imageUrl] = useGetImageUrl([owner.avatar ?? ""]);

  const [firstName, ...otherNames] = owner.name.trim().split(/\s+/);
  const label = translateAria(["activities", "row", "owner"], {
    name: owner.name
  });

  return (
    <span className="inline-flex shrink-0" role="img" aria-label={label}>
      <Avatar
        id={id}
        size="xs"
        firstName={firstName}
        lastName={otherNames.join(" ")}
        title={owner.name}
        ariaHidden
        src={imageUrl ?? ""}
      />
    </span>
  );
};

export default ActivityOwnerAvatar;
