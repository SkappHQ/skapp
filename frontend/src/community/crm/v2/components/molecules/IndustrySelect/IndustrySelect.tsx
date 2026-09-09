import {
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup,
  PlusIcon
} from "@rootcodelabs/skapp-ui";
import { AxiosError } from "axios";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { characterLengths } from "~community/common/constants/stringConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useToast } from "~community/common/providers/ToastProvider";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { useCreateIndustry } from "~community/crm/v2/api/IndustryApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  findMatchingIndustry,
  normalizeIndustryName
} from "~community/crm/v2/utils/industryUtil";

interface IndustrySelectProps {
  value?: number;
  onChange: (industryId: number | null) => void;
  canCreate: boolean;
  translateText: TranslatorFunctionType;
}

const IndustrySelect: FC<IndustrySelectProps> = ({
  value,
  onChange,
  canCreate,
  translateText
}) => {
  const { setToastMessage } = useToast();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [inlineError, setInlineError] = useState<string>("");

  // The org-wide industry list arrives with the board init data, so it is read from the
  // store rather than fetched again here. The dropdown filters it internally.
  const { industries, setIndustries } = useCrmStoreV2(
    useShallow((store) => ({
      industries: store.industries,
      setIndustries: store.setIndustries
    }))
  );

  const industryList = useMemo(() => Object.values(industries), [industries]);

  const options: DropdownOption[] = useMemo(
    () =>
      industryList.map((industry) => ({
        id: industry.id,
        value: industry.id,
        label: industry.name
      })),
    [industryList]
  );

  const selectedValue: DropdownOption | null = useMemo(() => {
    const selected = value != null ? industries[value] : undefined;
    return selected
      ? { id: selected.id, value: selected.id, label: selected.name }
      : null;
  }, [industries, value]);

  const trimmedSearchTerm = normalizeIndustryName(searchTerm);

  const { mutate: createIndustry, isPending: isCreating } = useCreateIndustry(
    (industry) => {
      // Added to the store immediately so the new industry is selectable without
      // waiting for the init-data refetch this mutation also triggers.
      setIndustries({
        ...industries,
        [industry.id]: { id: industry.id, name: industry.name }
      });

      // The server re-checks uniqueness, so a name that slipped past the local check
      // still resolves to the existing record rather than creating a duplicate.
      if (industry.alreadyExists) {
        onChange(industry.id);
        setInlineError(translateText(["validations", "industryExists"]));
        return;
      }

      onChange(industry.id);
      setInlineError("");
      setSearchTerm("");
    },
    (_error: AxiosError) => {
      // Not user-fixable, so this is a toast rather than an inline message. The typed
      // value is deliberately left in place so the user can retry.
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["toastMessages", "errorTitle"]),
        description: translateText([
          "toastMessages",
          "addIndustry",
          "errorDescription"
        ])
      });
    }
  );

  const handleSearch = (term: string): void => {
    // The dropdown's search input exposes no maxLength, so the hard stop is applied
    // here and re-enforced server-side.
    setSearchTerm(term.slice(0, characterLengths.INDUSTRY_NAME_LENGTH));
    setInlineError("");
  };

  const handleChange = (selected: DropdownValue | null): void => {
    setInlineError("");
    if (!selected) {
      onChange(null);
      return;
    }
    const { id } = selected as DropdownOption;
    onChange(Number(id));
  };

  const handleCreate = (): void => {
    if (isCreating) {
      return;
    }

    if (!trimmedSearchTerm) {
      setInlineError(translateText(["validations", "industryNameRequired"]));
      return;
    }

    if (findMatchingIndustry(industryList, trimmedSearchTerm)) {
      setInlineError(translateText(["validations", "industryExists"]));
      return;
    }

    createIndustry({ name: trimmedSearchTerm });
  };

  // Reflects what pressing the row will actually do, so the affordance reads as
  // "+ Add "Renewable Energy"" once something has been typed.
  const actionText = trimmedSearchTerm
    ? translateText(["labels", "addNamedIndustry"], {
        name: trimmedSearchTerm
      })
    : translateText(["labels", "addIndustry"]);

  return (
    <div className="flex flex-col">
      <DropdownWithSearchablePopup
        options={options}
        value={selectedValue}
        onChange={handleChange}
        onSearch={handleSearch}
        label={translateText(["labels", "industry"])}
        placeholder={translateText(["placeholders", "industry"])}
        searchPlaceholder={translateText(["placeholders", "industrySearch"])}
        noResultsText={translateText(["labels", "noIndustriesFound"])}
        searchable
        clearable
        width="w-full"
        ariaLabel={translateText(["ariaLabels", "industry"])}
        ariaInvalid={Boolean(inlineError)}
        // Pinned below the scrollable option list, and rendered only for roles that
        // can create - hidden rather than shown-disabled for everyone else.
        showAction={canCreate}
        actionFixed
        actionText={actionText}
        actionIcon={<PlusIcon />}
        onAction={handleCreate}
        renderNoResults={() =>
          canCreate && trimmedSearchTerm ? null : (
            <div className="px-4 py-2 body2 text-tertiary-text">
              {translateText(["labels", "noIndustriesFound"])}
            </div>
          )
        }
      />

      {/* Mirrors how the shared field components render errorMessage, so an inline
          industry error looks and reads exactly like any other field error. */}
      {inlineError && (
        <div className="mt-2">
          <p
            className="body3 text-[var(--color-semantic-red-accent)]"
            role="alert"
            aria-live="assertive"
          >
            {inlineError}
          </p>
        </div>
      )}
    </div>
  );
};

export default IndustrySelect;
