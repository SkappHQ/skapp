import {
  ButtonV2,
  CalendarIcon,
  CloseIcon,
  DatePicker,
  Dropdown,
  InputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import SelectableSearchField from "~community/crm/components/atoms/SelectableSearchField/SelectableSearchField";
import SelectedOwnerField from "~community/crm/components/molecules/SelectedOwnerField/SelectedOwnerField";
import { TaskFormContentProps } from "~community/crm/types/FormTypes";

import OwnerDropdownItem from "../../atoms/OwnerDropdownItem/OwnerDropdownItem";

const TaskFormContent: FC<TaskFormContentProps> = ({
  values,
  errors,
  handleChange,
  setFieldValue,
  isSubmitting,
  isPending,

  selectedOwner,
  ownerSearchText,
  ownerLookupItems,
  onOwnerSelect,
  onOwnerSearchChange,
  onOwnerRemove,
  isOwnerFetching,
  isCrmSalesManager,

  selectedContactLabel,
  contactSearchText,
  contactDropdownItems,
  onContactSelect,
  onContactSearchChange,
  onClearContact,
  isContactFetching,

  selectedDealLabel,
  dealSearchText,
  dealDropdownItems,
  onDealSelect,
  onDealSearchChange,
  onClearDeal,
  isDealFetching,

  priorityOptions,
  taskTypeOptions,

  onSubmit,
  onCancel,

  translateText
}) => {
  const ownerDropdownItems: SearchableDropdownItem[] = ownerLookupItems.map(
    (owner) => ({
      id: String(owner.employeeId),
      content: <OwnerDropdownItem owner={owner} />
    })
  );

  return (
    <div className="flex flex-col w-full h-full justify-between gap-[0.625rem]">
      <InputField
        name="name"
        value={values.name}
        errorMessage={errors.name}
        state={errors.name ? "error" : "default"}
        label={translateText(["labels", "task"])}
        placeholder={translateText(["placeholders", "task"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "task"])}
        fullWidth
        required
      />

      <div className="flex flex-row gap-[0.625rem]">
        <div className="flex-1">
          <Dropdown
            label={translateText(["labels", "type"])}
            placeholder={translateText(["placeholders", "type"])}
            options={taskTypeOptions.options}
            value={values.type?.id?.toString() ?? undefined}
            onChange={(value) =>
              setFieldValue(
                "type",
                taskTypeOptions.getCategoryById(Number(value)) ?? null
              )
            }
            errorMessage={errors.type}
            variant={errors.type ? "primary-error" : "primary"}
            width="100%"
            className="rounded-lg"
            ariaLabel={translateText(["ariaLabels", "type"])}
            required
          />
        </div>
        <div className="flex-1">
          <Dropdown
            label={translateText(["labels", "priority"])}
            placeholder={translateText(["placeholders", "priority"])}
            options={priorityOptions}
            value={values.priority ?? undefined}
            onChange={(value) => setFieldValue("priority", value)}
            errorMessage={errors.priority || ""}
            width="100%"
            className="rounded-lg"
            ariaLabel={translateText(["ariaLabels", "priority"])}
          />
        </div>
      </div>

      <div className="flex flex-row gap-[0.625rem]">
        <div className="flex-1">
          <DatePicker
            mode="single"
            selected={values.dueDate ? new Date(values.dueDate) : undefined}
            onSelect={(date: Date | undefined) =>
              setFieldValue("dueDate", date ? date.toISOString() : null)
            }
            popperProps={{ position: "bottom-end" }}
          >
            <div>
              <InputField
                name="dueDate"
                value={
                  values.dueDate
                    ? new Date(values.dueDate).toLocaleDateString()
                    : ""
                }
                label={translateText(["labels", "dueDate"])}
                placeholder={translateText(["placeholders", "dueDate"])}
                state={errors.dueDate ? "error" : "default"}
                errorMessage={errors.dueDate || ""}
                aria-label={translateText(["ariaLabels", "dueDate"])}
                rightIcon={<CalendarIcon />}
                fullWidth
                readOnly
                required
              />
            </div>
          </DatePicker>
        </div>
        <div className="flex-1">
          {selectedOwner ? (
            <SelectedOwnerField
              label={translateText(["labels", "taskOwner"])}
              owner={selectedOwner}
              onRemove={onOwnerRemove}
              showRemoveButton={isCrmSalesManager ?? false}
              ariaLabel={translateText(["ariaLabels", "removeOwner"])}
            />
          ) : (
            <SearchableDropdown
              id="owner-search"
              items={ownerDropdownItems}
              onSelect={onOwnerSelect}
              label={translateText(["labels", "taskOwner"])}
              placeholder={translateText(["placeholders", "taskOwner"])}
              value={ownerSearchText}
              onChange={(e) => onOwnerSearchChange(e.target.value)}
              state={errors.owner ? "error" : "default"}
              errorMessage={errors.owner}
              emptyMessage={
                isOwnerFetching ? undefined : (
                  <p className="px-4 py-2 body2">
                    {translateText(["emptyStates", "noOwners"])}
                  </p>
                )
              }
            />
          )}
        </div>
      </div>

      <SelectableSearchField
        id="contact-search"
        label={translateText(["labels", "contactName"])}
        placeholder={translateText(["placeholders", "contactName"])}
        selectedValue={values.contactId}
        selectedLabel={selectedContactLabel}
        searchText={contactSearchText}
        items={contactDropdownItems}
        onSelect={onContactSelect}
        onSearchChange={onContactSearchChange}
        onClear={onClearContact}
        isFetching={isContactFetching}
        emptyMessage={translateText(["emptyStates", "noContacts"])}
        inputAriaLabel={translateText(["ariaLabels", "contactName"])}
        clearAriaLabel={translateText(["ariaLabels", "clearContact"])}
      />

      <SelectableSearchField
        id="deal-search"
        label={translateText(["labels", "deal"])}
        placeholder={translateText(["placeholders", "deal"])}
        selectedValue={values.dealId}
        selectedLabel={selectedDealLabel}
        searchText={dealSearchText}
        items={dealDropdownItems}
        onSelect={onDealSelect}
        onSearchChange={onDealSearchChange}
        onClear={onClearDeal}
        isFetching={isDealFetching}
        emptyMessage={translateText(["emptyStates", "noDeals"])}
        inputAriaLabel={translateText(["ariaLabels", "deal"])}
        clearAriaLabel={translateText(["ariaLabels", "clearDeal"])}
      />

      <TextArea
        name="notes"
        value={values.notes}
        placeholder={translateText(["placeholders", "notes"])}
        label={translateText(["labels", "notes"])}
        onChange={handleChange}
        rows={3}
        aria-label={translateText(["ariaLabels", "notes"])}
      />

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateText(["ariaLabels", "cancel"])}
        >
          {translateText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || isPending}
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default TaskFormContent;
