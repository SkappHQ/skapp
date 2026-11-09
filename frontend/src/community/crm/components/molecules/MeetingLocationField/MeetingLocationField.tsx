import { InputField } from "@rootcodelabs/skapp-ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { ChangeEvent, FC, KeyboardEvent, useState } from "react";

import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { crmActivityQueryKeys } from "~community/crm/api/utils/QueryKeys";
import {
  MEETING_LOCATION_MIN_SEARCH_LENGTH,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { CrmMeetingLocation } from "~community/crm/types/CrmCommonTypes";

interface Props {
  id: string;
  value: string;
  errorMessage?: string;
  onTextChange: (text: string) => void;
  onPlacePick: (location: CrmMeetingLocation) => void;
  onBlur: () => void;
}

const MeetingLocationField: FC<Props> = ({
  id,
  value,
  errorMessage,
  onTextChange,
  onPlacePick,
  onBlur
}) => {
  const translateText = useTranslator("crmModule", "activities");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "scheduleMeeting",
    "modal"
  );
  const places = useMapsLibrary("places");

  const [sessionToken, setSessionToken] =
    useState<google.maps.places.AutocompleteSessionToken | null>(null);
  const [isListOpen, setIsListOpen] = useState(false);
  const [pickedLocation, setPickedLocation] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const debouncedValue = useDebounce(value.trim(), SEARCH_DEBOUNCE_DELAY);

  if (places && !sessionToken) {
    setSessionToken(new places.AutocompleteSessionToken());
  }

  const fetchPlacePredictions = async (
    input: string
  ): Promise<google.maps.places.PlacePrediction[] | null> => {
    if (!places || !sessionToken) return null;

    const { suggestions } =
      await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken
      });

    return suggestions.flatMap((suggestion) =>
      suggestion.placePrediction ? [suggestion.placePrediction] : []
    );
  };

  const fetchPlaceDetails = async (
    prediction: google.maps.places.PlacePrediction
  ): Promise<CrmMeetingLocation> => {
    const place = prediction.toPlace();
    await place.fetchFields({
      fields: ["displayName", "formattedAddress", "googleMapsURI"]
    });

    return {
      location: place.displayName ?? value,
      locationAddress: place.formattedAddress ?? "",
      locationUrl: place.googleMapsURI ?? ""
    };
  };

  const isSearchEnabled = Boolean(
    places &&
    sessionToken &&
    isListOpen &&
    debouncedValue !== pickedLocation &&
    debouncedValue.length >= MEETING_LOCATION_MIN_SEARCH_LENGTH
  );

  const {
    data: predictions,
    isFetching: isSearching,
    isError
  } = useQuery({
    queryKey: crmActivityQueryKeys.PLACE_PREDICTIONS(debouncedValue),
    queryFn: () => fetchPlacePredictions(debouncedValue),
    enabled: isSearchEnabled,
    refetchOnWindowFocus: false
  });

  const closeList = (): void => {
    setIsListOpen(false);
    setActiveIndex(null);
  };

  const { mutate: pickPlace, isPending: isPicking } = useMutation({
    mutationFn: fetchPlaceDetails,
    onSuccess: (location: CrmMeetingLocation) => {
      setPickedLocation(location.location);
      onPlacePick(location);
      closeList();
      setSessionToken(null);
    },
    onError: closeList
  });

  const isDebouncing = value.trim() !== debouncedValue;
  const isBusy = isDebouncing || isSearching || isPicking;
  const options = !isBusy && predictions ? predictions : [];
  const hasNoResults = !isBusy && (isError || predictions?.length === 0);
  const listId = `${id}-list`;

  const handleFocus = (): void => {
    setIsListOpen(true);
  };

  const handleBlur = (): void => {
    closeList();
    onBlur();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onTextChange(event.target.value);
    setIsListOpen(true);
    setActiveIndex(null);
  };

  const handlePick = (prediction: google.maps.places.PlacePrediction): void => {
    if (isPicking) return;
    pickPlace(prediction);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (!isSearchEnabled) return;

    if (event.key === "Escape") {
      event.stopPropagation();
      closeList();
      return;
    }

    if (options.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((previous) =>
        previous === null || previous >= options.length - 1 ? 0 : previous + 1
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((previous) =>
        previous === null || previous <= 0 ? options.length - 1 : previous - 1
      );
    } else if (event.key === "Enter" && activeIndex !== null) {
      event.preventDefault();
      handlePick(options[activeIndex]);
    }
  };

  return (
    <div className="relative w-full">
      <InputField
        id={id}
        name="location"
        value={value}
        label={translateText([
          "scheduleMeeting",
          "modal",
          "labels",
          "location"
        ])}
        placeholder={translateText([
          "scheduleMeeting",
          "modal",
          "placeholders",
          "location"
        ])}
        {...(errorMessage && { errorMessage })}
        state={errorMessage ? "error" : "default"}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-label={translateAria(["location"])}
        role="combobox"
        aria-expanded={isSearchEnabled}
        aria-controls={listId}
        aria-autocomplete="list"
        {...(activeIndex !== null && {
          "aria-activedescendant": `${id}-option-${activeIndex}`
        })}
        autoComplete="off"
        fullWidth
        required
      />
      {isSearchEnabled && (
        <ul
          id={listId}
          role="listbox"
          aria-label={translateAria(["locationSuggestions"])}
          className="absolute z-10 mt-1 flex w-full flex-col rounded-lg bg-white py-1 shadow-md"
        >
          {isBusy && (
            <li className="px-3 py-2 text-sm text-primary-text">
              {translateText(["logActivity", "emptyStates", "searching"])}
            </li>
          )}
          {hasNoResults && (
            <li className="px-3 py-2 text-sm text-primary-text">
              {translateText([
                "scheduleMeeting",
                "modal",
                "location",
                "noPlaces"
              ])}
            </li>
          )}
          {options.map((prediction, index) => (
            <li
              key={prediction.placeId}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handlePick(prediction)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handlePick(prediction);
                }
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`cursor-pointer px-3 py-2 text-left ${
                index === activeIndex
                  ? "bg-primary-background"
                  : "hover:bg-primary-background"
              }`}
            >
              {prediction.mainText && (
                <span className="block text-sm font-medium text-primary-text">
                  {prediction.mainText.text}
                </span>
              )}
              {prediction.secondaryText && (
                <span className="block text-xs text-label-text-slate">
                  {prediction.secondaryText.text}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MeetingLocationField;
