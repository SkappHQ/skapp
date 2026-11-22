import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import {
  PolicyLeaveRecipientType,
  PolicyLeaveRequestDetailType
} from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
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

  const isApproved = request.status === PolicyLeaveRequestStatus.APPROVED;
  const isPending = request.status === PolicyLeaveRequestStatus.PENDING;
  const primarySupervisor =
    request.primaryReviewer ??
    managers?.find((manager) => manager.isPrimaryManager);

  const recipients: PolicyLeaveRecipientType[] = [
    ...(primarySupervisor
      ? [
          {
            person: primarySupervisor,
            hasApproved: !!request.primaryReviewer || isApproved
          }
        ]
      : []),
    ...(request.requestAuthorizer
      ? [{ person: request.requestAuthorizer, hasApproved: isApproved }]
      : [])
  ];

  return (
    <div className="flex flex-row items-center gap-3.5">
      <span className="body1 whitespace-nowrap">
        {translateText(["recipient"])} :
      </span>
      <ol className="flex flex-row flex-wrap gap-2">
        {recipients.map(({ person, hasApproved }) => (
          <li
            key={person.employeeId}
            className="flex flex-row items-center gap-2 rounded-full bg-secondary-background py-1 pl-1 pr-3"
          >
            <Avatar
              firstName={person.firstName}
              lastName={person.lastName}
              src={person.authPic ?? ""}
            />
            <span className="body2 text-secondary-text">
              {person.firstName}
            </span>
            {(hasApproved || isPending) && (
              <span
                role="img"
                aria-label={translateAria(
                  [hasApproved ? "approved" : "pending"],
                  { name: `${person.firstName} ${person.lastName}` }
                )}
              >
                <Icon
                  name={
                    hasApproved
                      ? IconName.SUCCESS_TICK_ICON
                      : IconName.CLOCK_ICON
                  }
                />
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default PolicyMultiLevelRecipientsRow;
