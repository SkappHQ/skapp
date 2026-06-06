import { CircularProgress } from "@mui/material";
import {
  DropdownWithSearchablePopup,
  DropdownValue
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/DropdownWithSearchablePopup/DropdownWithSearchablePopup";
import { FC, useCallback, useRef } from "react";

import { CrmOwnerType } from "~community/crm/types/CommonTypes";

interface Props {
  users: CrmOwnerType[];
  selectedUser: CrmOwnerType | null;
  onSearch: (term: string) => void;
  onChange: (user: CrmOwnerType | null) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  placeholder: string;
  searchPlaceholder: string;
  ariaInvalid?: boolean;
}

const PeoplePopupSearch: FC<Props> = ({
  users,
  selectedUser,
  onSearch,
  onChange,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  placeholder,
  searchPlaceholder,
  ariaInvalid
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node || !hasNextPage) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

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
    const id =
      typeof val === "object"
        ? Number(val.id)
        : Number(val);
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
      renderOption={(option, index, onSelect) => {
        const opt = option as DropdownOption;
        const user = users.find((u) => u.employeeId === Number(opt.id));
        const isLast = hasNextPage && index === users.length - 1;
        return (
          <button
            type="button"
            ref={isLast ? sentinelRef : undefined}
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
              <div className="size-6 rounded-full bg-[#E5E7EB] shrink-0 flex items-center justify-center text-[10px] text-[#6B7280]">
                {user?.firstName?.[0]?.toUpperCase()}
              </div>
            )}
            <span>{[user?.firstName, user?.lastName].filter(Boolean).join(" ")}</span>
          </button>
        );
      }}
      renderNoResults={() =>
        isFetchingNextPage ? (
          <div className="flex justify-center py-3">
            <CircularProgress size={16} />
          </div>
        ) : (
          <div className="px-4 py-2 text-sm text-gray-400">No results</div>
        )
      }
    />
  );
};

export default PeoplePopupSearch;
