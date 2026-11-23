import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { concatStrings } from "~community/common/utils/commonUtil";
import { PolicyLeaveRequestDetailType } from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import { getMultiLevelRecipients } from "~community/leave/utils/policyLeave/policyLeaveReviewUtils";
import { useGetMyManagers } from "~community/people/api/PeopleApi";

interface Props {
  request: PolicyLeaveRequestDetailType;
}

const PolicyMultiLevelRecipientsRow: FC<Props> = ({ request }) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "myLeaveRequests"
  );
  const translateAria = useTranslator("leaveAria", "multiLevelRecipients");
  const { data: managers } = useGetMyManagers();

  const isPending = request.status === PolicyLeaveRequestStatus.PENDING;
  const recipients = getMultiLevelRecipients(
    request,
    managers?.find((manager) => manager.isPrimaryManager)
  );

  return (
    <div className="flex flex-row items-start gap-3.5">
      <span className="body1 mt-3 whitespace-nowrap">
        {translateText(["recipient"])} :
      </span>
      <div className="flex flex-row flex-wrap items-start gap-2">
        {recipients.map(({ person, hasApproved }) => {
          const name = concatStrings([person.firstName, person.lastName]);
          return (
            <AvatarChip
              key={person.employeeId}
              avatarProps={{
                id: `recipient-${person.employeeId}`,
                firstName: person.firstName,
                lastName: person.lastName,
                src: person.authPic ?? "",
                alt: name
              }}
              label={person.firstName}
              backgroundColor="bg-secondary-background"
              textColor="text-secondary-text"
              showActionButton={hasApproved || isPending}
              actionIcon={
                <Icon
                  name={
                    hasApproved
                      ? IconName.SUCCESS_TICK_ICON
                      : IconName.CLOCK_ICON
                  }
                  width="16"
                  height="16"
                  fill={
                    hasApproved
                      ? undefined
                      : "var(--color-semantic-amber-accent)"
                  }
                />
              }
              actionButtonAriaLabel={translateAria(
                [hasApproved ? "approved" : "pending"],
                { name }
              )}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PolicyMultiLevelRecipientsRow;
