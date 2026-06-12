import {
  DropdownValue,
  DropdownWithSearchablePopup
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/DropdownWithSearchablePopup/DropdownWithSearchablePopup";
import { FC } from "react";

import { CrmOwner } from "~community/crm/types/CommonTypes";

interface Props {
  users: CrmOwner[];
  selectedUser: CrmOwner | null;
  onSearch: (term: string) => void;
  onChange: (user: CrmOwner | null) => void;
  placeholder: string;
  searchPlaceholder: string;
  ariaInvalid?: boolean;
}

const PeoplePopupSearch: FC<Props> = ({
  users,
  selectedUser,
  onSearch,
  onChange,
  placeholder,
  searchPlaceholder,
  ariaInvalid
}) => {
  const options: DropdownOption[] = users.map((u) => ({
    id: u.employeeId,
    value: u.employeeId,
    label: [u.firstName, u.lastName].filter(Boolean).join(" ")
  }));

  const selectedValue: DropdownOption | null = selectedUser
    ? {
        id: selectedUser.employeeId,
        value: selectedUser.employeeId,
        label: [selectedUser.firstName, selectedUser.lastName]
          .filter(Boolean)
          .join(" ")
      }
    : null;

  const handleChange = (val: DropdownValue | null) => {
    if (!val) {
      onChange(null);
      return;
    }
    const id = typeof val === "object" ? Number(val.id) : Number(val);
    const user = users.find((u) => u.employeeId === id) ?? null;
    onChange(user);
  };

  return (
    <DropdownWithSearchablePopup
      options={options}
      value={selectedValue}
      onChange={handleChange}
      onSearch={onSearch}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      searchable
      clearable
      ariaInvalid={ariaInvalid}
      width="100%"
      renderOption={(option, _index, onSelect) => {
        const opt = option as DropdownOption;
        const user = users.find((u) => u.employeeId === Number(opt.id));
        return (
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer w-full text-left"
            onClick={() => onSelect(option)}
          >
            {user?.authPic ? (
              <img
                src={user.authPic}
                alt=""
                className="size-6 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="size-6 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-[10px] text-gray-500">
                {user?.firstName?.[0]?.toUpperCase()}
              </div>
            )}
            <span>
              {[user?.firstName, user?.lastName].filter(Boolean).join(" ")}
            </span>
          </button>
        );
      }}
      renderNoResults={() => (
        <div className="px-4 py-2 text-sm text-gray-400">No results</div>
      )}
    />
  );
};

export default PeoplePopupSearch;
