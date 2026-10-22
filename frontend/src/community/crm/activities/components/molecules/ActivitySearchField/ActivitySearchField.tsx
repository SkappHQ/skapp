import { InputField, SearchIcon } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useEffect, useState } from "react";

import { SEARCH_DEBOUNCE_DELAY } from "~community/common/constants/commonConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";

export interface ActivitySearchFieldProps {
  id: string;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  resultCount: number | null;
}

const ActivitySearchField: FC<ActivitySearchFieldProps> = ({
  id,
  searchTerm,
  onSearchChange,
  resultCount
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const [inputValue, setInputValue] = useState(searchTerm);
  const debouncedValue = useDebounce(inputValue.trim(), SEARCH_DEBOUNCE_DELAY);

  useEffect(() => {
    if (debouncedValue !== searchTerm) onSearchChange(debouncedValue);
  }, [debouncedValue, searchTerm, onSearchChange]);

  const isCountAnnounced = searchTerm.length > 0 && resultCount !== null;

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="sr-only">
        {translateText(["activities", "toolbar", "search", "label"])}
      </label>
      <InputField
        id={id}
        type="search"
        ariaLabelClearButton={translateAria([
          "activities",
          "toolbar",
          "clearSearch"
        ])}
        placeholder={translateText([
          "activities",
          "toolbar",
          "search",
          "placeholder"
        ])}
        className="w-[18rem] h-[3rem]"
        customStyles={{ borderRadius: "rounded-[1.5rem]" }}
        rightIcon={<SearchIcon />}
        value={inputValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setInputValue(event.target.value)
        }
        state="default"
      />
      <p
        id={`${id}-result-count`}
        className="sr-only"
        role="status"
        aria-live="polite"
      >
        {isCountAnnounced
          ? translateText(["activities", "toolbar", "search", "resultCount"], {
              count: resultCount
            })
          : ""}
      </p>
    </div>
  );
};

export default ActivitySearchField;
