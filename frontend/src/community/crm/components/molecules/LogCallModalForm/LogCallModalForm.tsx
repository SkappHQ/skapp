import {
  ButtonV2,
  CalendarIcon,
  CloseIcon,
  DatePicker,
  InfoIcon,
  InputField,
  SearchIcon,
  TextArea,
  Tooltip
} from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SelectedOwnerField from "~community/crm/components/molecules/SelectedOwnerField/SelectedOwnerField";
import { CrmOwnerEntity } from "~community/crm/types/CrmCommonTypes";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

interface Props {
  onCancel: () => void;
}

const LogCallModalForm: FC<Props> = ({ onCancel }) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const { data: currentUser } = useGetUserPersonalDetails();

  const [subject, setSubject] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [contact, setContact] = useState("");
  const [deal, setDeal] = useState("");
  const [company, setCompany] = useState("");
  const [comments, setComments] = useState("");
  const [isAssociationsOpen, setIsAssociationsOpen] = useState(false);

  const owner = useMemo((): CrmOwnerEntity | null => {
    if (!currentUser?.employeeId) return null;

    return {
      employeeId: Number(currentUser.employeeId),
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? "",
      authPic: currentUser.authPic as string | null
    };
  }, [
    currentUser?.employeeId,
    currentUser?.firstName,
    currentUser?.lastName,
    currentUser?.authPic
  ]);

  const label = (key: string) =>
    translateText(["activities", "logCall", "modal", "labels", key]);
  const placeholder = (key: string) =>
    translateText(["activities", "logCall", "modal", "placeholders", key]);
  const aria = (key: string) =>
    translateAria(["activities", "logCall", "modal", key]);
  const button = (key: string) =>
    translateText(["activities", "logCall", "modal", "buttons", key]);

  return (
    <div className="flex flex-col w-full h-full justify-between gap-[0.625rem] max-h-[78vh]">
      <div className="flex flex-col gap-[0.625rem] overflow-y-auto pr-1">
        <InputField
          name="subject"
          value={subject}
          label={label("subject")}
          placeholder={placeholder("subject")}
          onChange={(event) => setSubject(event.target.value)}
          aria-label={aria("subject")}
          fullWidth
          required
        />

        <div className="flex flex-row items-start gap-[0.625rem]">
          <div className="flex-1">
            <DatePicker
              mode="single"
              selected={date ?? undefined}
              onSelect={(selected) => setDate(selected ?? null)}
              popperProps={{ position: "bottom-start", isFlip: true }}
            >
              <div>
                <InputField
                  name="date"
                  value={date ? date.toLocaleDateString() : ""}
                  label={label("date")}
                  placeholder={placeholder("date")}
                  aria-label={aria("date")}
                  rightIcon={<CalendarIcon />}
                  fullWidth
                  readOnly
                />
              </div>
            </DatePicker>
          </div>
          <div className="flex-1">
            <InputField
              name="time"
              type="time"
              value={time}
              label={label("time")}
              placeholder={placeholder("time")}
              onChange={(event) => setTime(event.target.value)}
              aria-label={aria("time")}
              fullWidth
            />
          </div>
        </div>

        <div className="flex w-full flex-col gap-1">
          <div className="flex h-6 items-center justify-between">
            <span className="subtitle1 leading-normal">
              {label("duration")}
            </span>
            <Tooltip
              position="left"
              content={translateText([
                "activities",
                "logCall",
                "modal",
                "tooltips",
                "duration"
              ])}
            >
              <span aria-label={aria("durationInfo")}>
                <InfoIcon />
              </span>
            </Tooltip>
          </div>
          <InputField
            name="duration"
            value={duration}
            placeholder={placeholder("duration")}
            onChange={(event) => setDuration(event.target.value)}
            aria-label={aria("duration")}
            fullWidth
          />
        </div>

        <div className="flex flex-row items-start gap-[0.625rem]">
          <div className="flex-1">
            <Tooltip content={contact} disabled={!contact}>
              <InputField
                name="contact"
                value={contact}
                label={label("contact")}
                placeholder={placeholder("contact")}
                onChange={(event) => setContact(event.target.value)}
                aria-label={aria("contact")}
                rightIcon={<SearchIcon />}
                fullWidth
                required
              />
            </Tooltip>
          </div>
          <div className="flex-1">
            {owner && (
              <SelectedOwnerField
                label={label("activityOwner")}
                owner={owner}
                onRemove={() => {}}
                showRemoveButton={false}
                ariaLabel={aria("removeOwner")}
              />
            )}
          </div>
        </div>

        <TextArea
          name="comments"
          value={comments}
          label={label("comments")}
          placeholder={placeholder("comments")}
          onChange={(event) => setComments(event.target.value)}
          rows={4}
          aria-label={aria("comments")}
        />

        {isAssociationsOpen && (
          <>
            <Tooltip content={deal} disabled={!deal}>
              <InputField
                name="deal"
                value={deal}
                label={label("deal")}
                placeholder={placeholder("deal")}
                onChange={(event) => setDeal(event.target.value)}
                aria-label={aria("deal")}
                rightIcon={<SearchIcon />}
                fullWidth
              />
            </Tooltip>
            <Tooltip content={company} disabled={!company}>
              <InputField
                name="relatedTo"
                value={company}
                label={label("relatedTo")}
                placeholder={placeholder("relatedTo")}
                onChange={(event) => setCompany(event.target.value)}
                aria-label={aria("relatedTo")}
                rightIcon={<SearchIcon />}
                fullWidth
              />
            </Tooltip>
          </>
        )}

        <button
          type="button"
          className="self-start text-sm text-primary underline"
          aria-expanded={isAssociationsOpen}
          aria-label={aria("toggleAssociations")}
          onClick={() => setIsAssociationsOpen((open) => !open)}
        >
          {isAssociationsOpen
            ? button("hideAssociations")
            : button("addAssociations")}
        </button>
      </div>

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          onClick={onCancel}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={aria("cancel")}
        >
          {button("cancel")}
        </ButtonV2>
        <ButtonV2 variant="primary" type="button" aria-label={aria("save")}>
          {button("save")}
        </ButtonV2>
      </div>
    </div>
  );
};

export default LogCallModalForm;
