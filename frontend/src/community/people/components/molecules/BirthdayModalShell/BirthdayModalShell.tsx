import { Avatar, LargeModal } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { useTranslator } from "~community/common/hooks/useTranslator";
import BirthdayCelebrationPanel from "~community/people/components/molecules/BirthdayCelebrationPanel/BirthdayCelebrationPanel";
import {
  BIRTHDAY_MODAL_CENTERED_CONTENT_CLASS,
  BIRTHDAY_MODAL_CLASS
} from "~community/people/constants/birthdayNotificationConstants";
import { EmployeeBirthdayType } from "~community/people/types/BirthdayNotificationTypes";
import { getFullName } from "~community/people/utils/birthdayNotificationUtils";

interface Props {
  id: string;
  employee: EmployeeBirthdayType;
  heading: string;
  body: string;
  position: number;
  total: number;
  onDismiss: () => void;
}

const BirthdayModalShell: FC<Props> = ({
  id,
  employee,
  heading,
  body,
  position,
  total,
  onDismiss
}) => {
  const translateAria = useTranslator("peopleAria", "birthdayNotifications");
  const imageUrl = useGetImageUrl(employee.authPic ?? "");

  return (
    <LargeModal
      id={id}
      isOpen
      className={BIRTHDAY_MODAL_CLASS}
      imagePosition="left"
      backdropVariant="dark"
      onClose={onDismiss}
      closeButtonAriaLabel={translateAria(["closeButton"])}
      ariaLabel={heading}
      image={<BirthdayCelebrationPanel />}
      content={
        <div className={BIRTHDAY_MODAL_CENTERED_CONTENT_CLASS}>
          {total > 1 && (
            <p className="sr-only">
              {translateAria(["notificationPosition"], {
                current: position,
                total
              })}
            </p>
          )}
          <Avatar
            id={`${id}-avatar`}
            size="2xl"
            src={imageUrl ?? undefined}
            firstName={employee.firstName}
            lastName={employee.lastName}
            alt={translateAria(["profilePhoto"], {
              name: getFullName(employee)
            })}
          />
          <h2 className="h1 leading-6 tracking-[0.07px] wrap-break-word text-black">
            {heading}
          </h2>
          <p className="body2 max-w-104 leading-normal text-secondary-text">
            {body}
          </p>
        </div>
      }
    />
  );
};

export default BirthdayModalShell;
