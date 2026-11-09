import { InputField } from "@rootcodelabs/skapp-ui";
import { useMutation } from "@tanstack/react-query";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { ChangeEvent, FC, useEffect, useState } from "react";

import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
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
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "scheduleMeeting",
    "modal"
  );
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

  const debouncedValue = useDebounce(value.trim(), SEARCH_DEBOUNCE_DELAY);

  const fetchPlacePredictions = async (
    placesLibrary: google.maps.PlacesLibrary,
    token: google.maps.places.AutocompleteSessionToken,
    input: string
  ): Promise<google.maps.places.PlacePrediction[]> => {
    const { suggestions } =
      await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken: token
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
      location: `${place.displayName}, ${place.formattedAddress}`,
      locationUrl: `${place.googleMapsURI}`
    };
  };

  const isSearchEnabled = Boolean(
    places &&
    sessionToken &&
    isListOpen &&
    debouncedValue.length >= MEETING_LOCATION_MIN_SEARCH_LENGTH
  );

  const {
    mutate: searchPlaces,
    data: predictions,
    isPending: isSearching,
    isError
  } = useMutation({
    mutationFn: (input: string) =>
      fetchPlacePredictions(
        places as google.maps.PlacesLibrary,
        sessionToken as google.maps.places.AutocompleteSessionToken,
        input
      )
  });

  useEffect(() => {
    if (isSearchEnabled) searchPlaces(debouncedValue);
  }, [debouncedValue, isSearchEnabled]);

  const { mutate: pickPlace, isPending: isPicking } = useMutation({
    mutationFn: fetchPlaceDetails,
    onSuccess: (location: CrmMeetingLocation) => {
      onPlacePick(location);
      setIsListOpen(false);
      setSessionToken(places && new places.AutocompleteSessionToken());
    }
  });

  const handleFocus = (): void => {
    if (places && !sessionToken) {
      setSessionToken(new places.AutocompleteSessionToken());
    }
    setIsListOpen(true);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onTextChange(event.target.value);
    setIsListOpen(true);
  };

  const handlePick = (prediction: google.maps.places.PlacePrediction): void => {
    if (isPicking) return;
    pickPlace(prediction);
  };

  const isBusy = isSearching || isPicking;
  const hasNoResults =
    !isBusy && (isError || (predictions && predictions.length === 0));

  return (
    <div className="relative w-full">
      <InputField
        id={id}
        name="location"
        value={value}
        label={translateText(["labels", "location"])}
        placeholder={translateText(["placeholders", "location"])}
        {...(errorMessage && { errorMessage })}
        state={errorMessage ? "error" : "default"}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={onBlur}
        aria-label={translateAria(["location"])}
        autoComplete="off"
        fullWidth
        required
      />
      {isSearchEnabled && (
        <ul
          role="listbox"
          aria-label={translateText(["location", "suggestions"])}
          className="absolute z-10 mt-1 flex w-full flex-col rounded-lg bg-white py-1 shadow-md"
        >
          {isBusy && (
            <li className="px-3 py-2 text-sm text-primary-text">
              {translateText(["location", "searching"])}
            </li>
          )}
          {hasNoResults && (
            <li className="px-3 py-2 text-sm text-primary-text">
              {translateText(["location", "noPlaces"])}
            </li>
          )}
          {!isBusy &&
            predictions &&
            predictions.map((prediction) => (
              <li key={prediction.placeId} role="option" aria-selected={false}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-primary-background focus:bg-primary-background"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handlePick(prediction)}
                >
                  {prediction.mainText && (
                    <span className="block text-sm font-medium text-primary-text">
                      {prediction.mainText.text}
                    </span>
                  )}
                  {prediction.secondaryText && (
                    <span className="block text-xs text-[var(--color-label-text-slate)]">
                      {prediction.secondaryText.text}
                    </span>
                  )}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default MeetingLocationField;
