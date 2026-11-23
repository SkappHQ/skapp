import { Box, Stack, Typography } from "@mui/material";
import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
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
    <Box
      component="div"
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: "14px"
      }}
    >
      <Typography
        component="div"
        sx={{
          fontWeight: "400",
          fontSize: "16px",
          lineHeight: "16px",
          whiteSpace: "nowrap",
          mt: "0.75rem"
        }}
      >
        {translateText(["recipient"])} :
      </Typography>
      <Stack direction="row" gap={1} flexWrap="wrap" alignItems="flex-start">
        {recipients.map(({ person, hasApproved }) => {
          const name = `${person.firstName} ${person.lastName}`;
          const showStatus = hasApproved || isPending;
          return (
            <div key={person.employeeId}>
              <AvatarChip
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
                showActionButton={showStatus}
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
            </div>
          );
        })}
      </Stack>
    </Box>
  );
};

export default PolicyMultiLevelRecipientsRow;
