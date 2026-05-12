import { InputField } from "@rootcodelabs/skapp-ui";
import { useMap } from "@vis.gl/react-google-maps";
import { Box } from "@mui/material";
import { useCallback, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import { forwardGeocode } from "~community/configurations/utils/geofenceUtils";

export interface AddressSearchProps {
  onResult: (lat: number, lng: number, address: string) => void;
  onError: (msg: string) => void;
  searchPlaceholder: string;
}

const AddressSearch = ({
  onResult,
  onError,
  searchPlaceholder
}: AddressSearchProps) => {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsSearching(true);
    try {
      const result = await forwardGeocode(trimmed);
      if (result) {
        onResult(result.lat, result.lng, result.formattedAddress);
        map?.panTo({ lat: result.lat, lng: result.lng });
        map?.setZoom(14);
      } else {
        onError("noResults");
      }
    } catch {
      onError("networkError");
    } finally {
      setIsSearching(false);
    }
  }, [query, map, onResult, onError]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
      <InputField
        label=""
        placeholder={searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        rightIcon={
          <Box
            component="button"
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            sx={{
              background: "none",
              border: "none",
              cursor: isSearching ? "not-allowed" : "pointer",
              p: 0,
              display: "flex",
              alignItems: "center"
            }}
          >
            <Icon name={IconName.SEARCH_ICON} />
          </Box>
        }
        state="default"
      />
  );
};

export default AddressSearch;
