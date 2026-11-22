import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import {
  PolicyLeaveRequestDetailType,
  PolicyLeaveReviewEmployeeType
} from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import { useGetMyManagers } from "~community/people/api/PeopleApi";

interface Props {
  request: PolicyLeaveRequestDetailType;
}

interface Recipient {
  person: Pick<
    PolicyLeaveReviewEmployeeType,
    "employeeId" | "firstName" | "lastName" | "authPic"
  >;
  hasApproved: boolean;
}

const PolicyMultiLevelRecipientsRow: FC<Props> = ({ request }) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "myLeaveRequests"
  );
  const { data: managers } = useGetMyManagers();

  const isApproved = request.status === PolicyLeaveRequestStatus.APPROVED;
  const primarySupervisor =
    request.primaryReviewer ??
    managers?.find((manager) => manager.isPrimaryManager);

  const recipients: Recipient[] = [];
  if (primarySupervisor) {
    recipients.push({
      person: primarySupervisor,
      hasApproved: !!request.primaryReviewer || isApproved
    });
  }
  if (request.requestAuthorizer) {
    recipients.push({
      person: request.requestAuthorizer,
      hasApproved: isApproved
    });
  }

  return (
    <div className="flex flex-row items-center gap-[14px]" tabIndex={0}>
      <span className="body1 whitespace-nowrap">
        {translateText(["recipient"])} :
      </span>
      <ol className="flex flex-row flex-wrap gap-2">
        {recipients.map(({ person, hasApproved }) => {
          const name = `${person.firstName} ${person.lastName}`;
          return (
            <li
              key={person.employeeId}
              className="flex flex-row items-center gap-2 rounded-full bg-grey-100 py-1 pl-1 pr-3"
              aria-label={translateText(
                [hasApproved ? "recipientApproved" : "recipientPending"],
                { name }
              )}
            >
              <Avatar
                firstName={person.firstName}
                lastName={person.lastName}
                src={person.authPic ?? ""}
              />
              <span className="body2 text-secondary-text">
                {person.firstName}
              </span>
              <Icon
                name={
                  hasApproved ? IconName.SUCCESS_TICK_ICON : IconName.CLOCK_ICON
                }
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default PolicyMultiLevelRecipientsRow;
