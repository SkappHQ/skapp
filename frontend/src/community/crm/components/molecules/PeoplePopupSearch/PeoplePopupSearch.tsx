import { Avatar, DropdownWithSearchablePopup } from "@rootcodelabs/skapp-ui";
import type {
  DropdownOption,
  DropdownValue,
  TriggerProps
} from "@rootcodelabs/skapp-ui/dist/types/components/molecules/DropdownWithSearchablePopup/DropdownWithSearchablePopup";
import React, { FC, useMemo } from "react";

import { CrmOwnerType } from "~community/crm/types/CommonTypes";

interface Props {
  users: CrmOwnerType[];
  selectedUser: CrmOwnerType | null;
  onChange: (user: CrmOwnerType | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  ariaInvalid?: boolean;
  ariaErrorMessage?: string;
}

const PeoplePopupSearch: FC<Props> = ({
  users,
  selectedUser,
  onChange,
  placeholder,
  searchPlaceholder,
  onSearch,
  ariaInvalid,
  ariaErrorMessage
}) => {
  const options = useMemo<DropdownOption[]>(
    () =>
      users.map((u) => ({
        id: String(u.employeeId),
        value: String(u.employeeId),
        label: `${u.firstName}${u.lastName ? " " + u.lastName : ""}`
      })),
    [users]
  );

  const selectedOption = useMemo(
    () =>
      selectedUser
        ? (options.find((o) => o.id === String(selectedUser.employeeId)) ?? null)
        : null,
    [selectedUser, options]
  );

  const handleChange = (v: DropdownValue | null) => {
    if (!v) {
      onChange(null);
      return;
    }
    const id = typeof v === "object" ? String(v.id) : String(v);
    onChange(users.find((u) => String(u.employeeId) === id) ?? null);
  };

  const renderTrigger = (
    _value: DropdownValue | null,
    _isOpen: boolean,
    _disabled: boolean,
    triggerProps: TriggerProps
  ) => {
    const { ref, onKeyDown, ...rest } = triggerProps;

    if (selectedUser) {
      const displayName = `${selectedUser.firstName}${
        selectedUser.lastName ? ` ${selectedUser.lastName}` : ""
      }`;
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          role="button"
          tabIndex={0}
          onKeyDown={
            onKeyDown as unknown as React.KeyboardEventHandler<HTMLDivElement>
          }
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg w-full"
          {...rest}
        >
          <Avatar
            id={String(selectedUser.employeeId)}
            size="xs"
            src={selectedUser.authPic ?? undefined}
            firstName={selectedUser.firstName}
            lastName={selectedUser.lastName ?? undefined}
          />
          <span className="text-[14px] text-[#111827]">{displayName}</span>
        </div>
      );
    }

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role="button"
        tabIndex={0}
        onKeyDown={
          onKeyDown as unknown as React.KeyboardEventHandler<HTMLDivElement>
        }
        className="text-[14px] text-[#9CA3AF] cursor-pointer hover:bg-gray-50 rounded-lg w-full"
        {...rest}
      >
        {placeholder}
      </div>
    );
  };

  const renderOption = (
    option: DropdownValue,
    _index: number,
    onSelect: (o: DropdownValue) => void
  ) => {
    const id = typeof option === "object" ? String(option.id) : String(option);
    const user = users.find((u) => String(u.employeeId) === id);
    const label =
      typeof option === "object" ? String(option.label) : String(option);

    return (
      <div
        key={id}
        role="option"
        tabIndex={0}
        aria-selected={
          selectedUser ? String(selectedUser.employeeId) === id : false
        }
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50"
        onClick={() => onSelect(option)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect(option);
        }}
      >
        <Avatar
          id={id}
          size="xs"
          src={user?.authPic ?? undefined}
          firstName={user?.firstName ?? label}
          lastName={user?.lastName ?? undefined}
        />
        <span className="text-[14px] text-[#111827]">{label}</span>
      </div>
    );
  };

  return (
    <DropdownWithSearchablePopup
      options={options}
      value={selectedOption}
      onChange={handleChange}
      onSearch={onSearch}
      searchable
      clearable
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      width="100%"
      renderTrigger={renderTrigger}
      renderOption={renderOption}
      ariaInvalid={ariaInvalid}
      ariaErrorMessage={ariaErrorMessage}
    />
  );
};

export default PeoplePopupSearch;
