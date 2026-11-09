import { CloseIcon, SmallModal } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import GoogleCalendarIcon from "~community/common/assets/Icons/GoogleCalendarIcon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import CalendarEventCard from "~community/crm/components/molecules/CalendarEventCard/CalendarEventCard";
import { useConnectGoogleCalendar } from "~enterprise/common/api/CalendarApi";

interface Props {
  onClose: () => void;
}

const ConnectGoogleCalendarModal: FC<Props> = ({ onClose }) => {
  const translateText = useTranslator("crmModule", "activities");
  const { setToastMessage } = useToast();

  const handleSuccess = (data: { authUrl?: string }): void => {
    if (data?.authUrl) {
      globalThis.location.href = data.authUrl;
    }
  };

  const handleError = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["logActivity", "toastMessages", "errorTitle"]),
      description: translateText([
        "scheduleMeeting",
        "connectCalendarModal",
        "errorDescription"
      ]),
      isIcon: true
    });
  };

  const { mutate: connectGoogleCalendar, isPending } = useConnectGoogleCalendar(
    handleSuccess,
    handleError
  );

  const handleConnect = (): void => {
    if (isPending) return;

    const redirectUrl = new URL(globalThis.location.href);
    redirectUrl.searchParams.set("success", "true");
    redirectUrl.searchParams.set("type", "google");
    connectGoogleCalendar(redirectUrl.toString());
  };

  return (
    <SmallModal
      isOpen
      onClose={onClose}
      modalHeader={translateText([
        "scheduleMeeting",
        "connectCalendarModal",
        "title"
      ])}
      content={
        <div className="flex flex-col gap-6">
          <CalendarEventCard
            icon={<GoogleCalendarIcon />}
            title={translateText([
              "scheduleMeeting",
              "connectCalendarModal",
              "calendarName"
            ])}
            details={[
              translateText([
                "scheduleMeeting",
                "connectCalendarModal",
                "notConnected"
              ])
            ]}
          />
          <p className="text-base text-black">
            {translateText([
              "scheduleMeeting",
              "connectCalendarModal",
              "description"
            ])}
          </p>
        </div>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          children: translateText(["logActivity", "buttons", "cancel"]),
          icon: <CloseIcon />,
          iconPosition: "end",
          disabled: isPending,
          onClick: onClose
        },
        buttonRight: {
          variant: "primary",
          children: translateText([
            "scheduleMeeting",
            "connectCalendarModal",
            "connectBtn"
          ]),
          disabled: isPending,
          isLoading: isPending,
          onClick: handleConnect
        }
      }}
    />
  );
};

export default ConnectGoogleCalendarModal;
