import { Avatar, LargeModal } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useState } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { concatStrings } from "~community/common/utils/commonUtil";
import BirthdayCelebration from "~community/people/assets/images/BirthdayCelebration";
import { EmployeeBirthdayType } from "~community/people/types/BirthdayNotificationTypes";
import Confetti from "~community/common/components/atoms/Confetti/Confetti";

interface Props {
  id: string;
  employee: EmployeeBirthdayType;
  heading: string;
  body: string;
  position: number;
  total: number;
  onDismiss: () => void;
  showConfetti?: boolean;
}

const BirthdayModalShell: FC<Props> = ({
  id,
  employee,
  heading,
  body,
  position,
  total,
  onDismiss,
  showConfetti = false
}) => {
  const translateAria = useTranslator("peopleAria", "birthdayNotifications");
  const imageUrl = useGetImageUrl(employee.authPic ?? "");
  const [isConfettiVisible, setIsConfettiVisible] = useState(showConfetti);

  useEffect(() => {
    if (!showConfetti) return;

    const timer = setTimeout(() => {
      setIsConfettiVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [showConfetti]);

  return (
    <>
      {isConfettiVisible && <Confetti />}
      <LargeModal
        id={id}
        isOpen
        className="relative h-[603px] max-h-[85vh] w-[1107px] max-w-[92vw] overflow-hidden rounded-l-[42.69px] rounded-r-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
        imagePosition="left"
        backdropVariant="dark"
        onClose={onDismiss}
        closeButtonAriaLabel={translateAria(["closeButton"])}
        ariaLabel={heading}
        image={
          <div className="relative h-full w-full bg-white">
            <BirthdayCelebration />
          </div>
        }
        content={
          <div className="flex h-[555px] flex-col items-center justify-center gap-4 text-center">
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
                name: employee.lastName
                  ? concatStrings([employee.firstName, employee.lastName])
                  : employee.firstName
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
    </>
  );
};

export default BirthdayModalShell;
