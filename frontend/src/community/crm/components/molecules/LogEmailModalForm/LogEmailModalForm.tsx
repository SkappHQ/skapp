import {
  CalendarIcon,
  DatePicker,
  Dropdown,
  InputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  getActivityTimeOptions,
  toDateFieldValue,
  toPickerDate
} from "~community/crm/activities/utils/activityUtil";
import ActivityAssociations from "~community/crm/components/molecules/ActivityAssociations/ActivityAssociations";
import ActivityContactsField from "~community/crm/components/molecules/ActivityContactsField/ActivityContactsField";
import ActivityDealField from "~community/crm/components/molecules/ActivityDealField/ActivityDealField";
import ActivityRelatedToField from "~community/crm/components/molecules/ActivityRelatedToField/ActivityRelatedToField";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactEntity,
  CrmLogEmailFormValues
} from "~community/crm/types/CrmCommonTypes";
import {
  getContactCompanyIds,
  getContactDisplayName
} from "~community/crm/utils/contactUtil";
import { isDealMatchingContacts } from "~community/crm/utils/dealUtil";

interface Props {
  formik: FormikProps<CrmLogEmailFormValues>;
}

const LogEmailModalForm: FC<Props> = ({ formik }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  const translateText = useTranslator("crmModule", "activities");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logEmail",
    "modal"
  );

  const [isBccOpen, setIsBccOpen] = useState(values.bccContactIds.length > 0);
  const [isCcOpen, setIsCcOpen] = useState(values.ccContactIds.length > 0);

  const { contacts, deals } = useCrmStore(
    useShallow((store) => ({
      contacts: store.contacts,
      deals: store.deals
    }))
  );

  const [isDealClearedNoticeVisible, setIsDealClearedNoticeVisible] =
    useState(false);

  const recipientIds = [
    ...values.toContactIds,
    ...values.ccContactIds,
    ...values.bccContactIds
  ];

  const recipients = recipientIds.map((contactId) => contacts[contactId]);

  const recipientCompanyIds = Array.from(
    new Set(getContactCompanyIds(contacts, recipientIds))
  );

  const isDealMismatch = Boolean(
    values.dealId &&
    recipients.length > 0 &&
    !isDealMatchingContacts(deals[values.dealId], recipients)
  );

  const handleRecipientsChange = (
    nextFieldContacts: CrmContactEntity[],
    otherRecipientIds: number[]
  ): void => {
    const selectedDeal = values.dealId ? deals[values.dealId] : null;

    const nextRecipients = [
      ...nextFieldContacts,
      ...otherRecipientIds.map((contactId) => contacts[contactId])
    ];

    const isDealUnmatched =
      selectedDeal &&
      nextRecipients.length > 0 &&
      isDealMatchingContacts(selectedDeal, recipients) &&
      !isDealMatchingContacts(selectedDeal, nextRecipients);

    if (isDealUnmatched) {
      setFieldValue("dealId", null);
      setIsDealClearedNoticeVisible(true);
    }
  };

  const primaryRecipient =
    values.toContactIds.length > 0 ? contacts[values.toContactIds[0]] : null;

  const isCompanyMismatch = Boolean(
    values.companyId &&
    primaryRecipient &&
    values.companyId !== primaryRecipient.companyId
  );

  const pickedDate = values.date ? toPickerDate(values.date) : null;

  const handleDateSelect = (date?: Date): void => {
    setFieldValue("date", date ? toDateFieldValue(date) : null, true);
  };

  return (
    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
      <InputField
        id="log-email-from-input"
        name="fromAddress"
        value={values.fromAddress}
        label={translateText(["logEmail", "modal", "labels", "from"])}
        placeholder={translateText([
          "logEmail",
          "modal",
          "placeholders",
          "from"
        ])}
        errorMessage={touched.fromAddress ? errors.fromAddress : ""}
        state={touched.fromAddress && errors.fromAddress ? "error" : "default"}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateAria(["from"])}
        fullWidth
      />

      <div className="flex flex-row items-start gap-[0.625rem]">
        <div className="flex-1">
          <DatePicker
            mode="single"
            {...(pickedDate && { selected: pickedDate })}
            onSelect={handleDateSelect}
            popperProps={{ position: "bottom-start", isFlip: true }}
          >
            <div>
              <InputField
                id="log-email-date-input"
                name="date"
                value={pickedDate ? pickedDate.toLocaleDateString() : ""}
                label={translateText(["logActivity", "labels", "date"])}
                placeholder={translateText([
                  "logActivity",
                  "placeholders",
                  "date"
                ])}
                errorMessage={errors.date}
                state={errors.date ? "error" : "default"}
                aria-label={translateAria(["date"])}
                rightIcon={<CalendarIcon />}
                fullWidth
                readOnly
                required
              />
            </div>
          </DatePicker>
        </div>
        <div className="flex-1">
          <Dropdown
            id="log-email-time-input"
            options={getActivityTimeOptions()}
            value={values.time}
            onChange={(value) => setFieldValue("time", value, true)}
            label={translateText(["logEmail", "modal", "labels", "time"])}
            placeholder={translateText(["logActivity", "placeholders", "time"])}
            variant={errors.time ? "primary-error" : "primary"}
            errorMessage={errors.time}
            className="rounded-lg"
            ariaLabel={translateAria(["time"])}
            width="100%"
            scrollToSelected
            required
          />
        </div>
      </div>

      <ActivityContactsField
        id="log-email-to"
        formik={formik}
        name="toContactIds"
        label={translateText(["logEmail", "modal", "labels", "to"])}
        placeholder={translateText([
          "logEmail",
          "modal",
          "placeholders",
          "recipients"
        ])}
        groupAriaLabel={translateAria(["to"])}
        hiddenContactIds={[...values.ccContactIds, ...values.bccContactIds]}
        onContactsChange={(nextContacts) =>
          handleRecipientsChange(nextContacts, [
            ...values.ccContactIds,
            ...values.bccContactIds
          ])
        }
        required
        fillsRelatedTo
        actions={
          (!isBccOpen || !isCcOpen) && (
            <div className="flex flex-row gap-6">
              {!isBccOpen && (
                <button
                  type="button"
                  className="text-primary-text"
                  aria-label={translateAria(["bcc"])}
                  onClick={() => setIsBccOpen(true)}
                >
                  {translateText(["logEmail", "modal", "labels", "bcc"])}
                </button>
              )}
              {!isCcOpen && (
                <button
                  type="button"
                  className="text-primary-text"
                  aria-label={translateAria(["cc"])}
                  onClick={() => setIsCcOpen(true)}
                >
                  {translateText(["logEmail", "modal", "labels", "cc"])}
                </button>
              )}
            </div>
          )
        }
      />

      {(isBccOpen || isCcOpen) && (
        <div className="flex flex-row items-start gap-[0.625rem]">
          {isBccOpen && (
            <div className="min-w-0 flex-1">
              <ActivityContactsField
                id="log-email-bcc"
                formik={formik}
                name="bccContactIds"
                label={translateText(["logEmail", "modal", "labels", "bcc"])}
                placeholder={translateText([
                  "logEmail",
                  "modal",
                  "placeholders",
                  "recipients"
                ])}
                groupAriaLabel={translateAria(["bcc"])}
                hiddenContactIds={[
                  ...values.toContactIds,
                  ...values.ccContactIds
                ]}
                onContactsChange={(nextContacts) =>
                  handleRecipientsChange(nextContacts, [
                    ...values.toContactIds,
                    ...values.ccContactIds
                  ])
                }
              />
            </div>
          )}
          {isCcOpen && (
            <div className="min-w-0 flex-1">
              <ActivityContactsField
                id="log-email-cc"
                formik={formik}
                name="ccContactIds"
                label={translateText(["logEmail", "modal", "labels", "cc"])}
                placeholder={translateText([
                  "logEmail",
                  "modal",
                  "placeholders",
                  "recipients"
                ])}
                groupAriaLabel={translateAria(["cc"])}
                hiddenContactIds={[
                  ...values.toContactIds,
                  ...values.bccContactIds
                ]}
                onContactsChange={(nextContacts) =>
                  handleRecipientsChange(nextContacts, [
                    ...values.toContactIds,
                    ...values.bccContactIds
                  ])
                }
              />
            </div>
          )}
        </div>
      )}

      <InputField
        id="log-email-subject-input"
        name="subject"
        value={values.subject}
        label={translateText(["logActivity", "labels", "subject"])}
        placeholder={translateText(["logActivity", "placeholders", "subject"])}
        errorMessage={touched.subject ? errors.subject : ""}
        state={touched.subject && errors.subject ? "error" : "default"}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateAria(["subject"])}
        fullWidth
        required
      />

      <TextArea
        name="description"
        value={values.description}
        label={translateText(["logEmail", "modal", "labels", "description"])}
        placeholder={translateText([
          "logEmail",
          "modal",
          "placeholders",
          "description"
        ])}
        onChange={handleChange}
        rows={4}
        aria-label={translateAria(["description"])}
      />

      <ActivityAssociations
        isForcedOpen={isDealClearedNoticeVisible || isDealMismatch}
      >
        <ActivityDealField
          id="log-email-deal"
          formik={formik}
          fieldAriaLabel={translateAria(["deal"])}
          isClearedNoticeVisible={isDealClearedNoticeVisible}
          isMismatch={isDealMismatch}
          onDealChange={() => setIsDealClearedNoticeVisible(false)}
          {...(recipientCompanyIds.length === 1 && {
            filterCompanyId: recipientCompanyIds[0]
          })}
        />
        <ActivityRelatedToField
          id="log-email-related-to"
          formik={formik}
          fieldAriaLabel={translateAria(["relatedTo"])}
          {...(isCompanyMismatch &&
            primaryRecipient && {
              mismatchTooltip: translateText(
                ["logActivity", "tooltips", "relatedToMismatch"],
                { name: getContactDisplayName(primaryRecipient) }
              )
            })}
        />
      </ActivityAssociations>
    </div>
  );
};

export default LogEmailModalForm;
