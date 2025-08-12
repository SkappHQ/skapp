import { Chip, useMediaQuery } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { pascalCaseFormatter } from "~community/common/utils/commonUtil";

interface Props {
  filterOptions: string[];
  onDeleteIcon?: (label?: string) => void;
}

const ShowSelectedFilters = ({ filterOptions, onDeleteIcon }: Props) => {
  const translateAria = useTranslator(
    "commonAria",
    "components",
    "filterButton"
  );
  const theme: Theme = useTheme();
  const isMiniTabScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const isTabScreen = useMediaQuery(theme.breakpoints.down("xl"));
  const visibleFilterCount = isMiniTabScreen ? 0 : isTabScreen ? 1 : 2;
  return (
    <>
      {filterOptions.length > 0 &&
        filterOptions
          ?.slice(0, visibleFilterCount)
          .map((option: string, index: number) => (
            <Chip
              key={index}
              tabIndex={0}
              role="button"
              label={pascalCaseFormatter(option)}
              sx={{
                flexDirection: "row",
                border: "0.0625rem solid",
                borderColor: theme.palette.grey[500],
                backgroundColor: theme.palette.grey[100],
                color: theme.palette.common.black,
                paddingX: "0.5rem"
              }}
              onDelete={() => onDeleteIcon && onDeleteIcon(option)}
              aria-label={translateAria(["appliedFilter"], {
                filterLabel: pascalCaseFormatter(option)
              })}
              deleteIcon={
                <Icon name={IconName.CLOSE_ICON} height="1rem" width="1rem" />
              }
            />
          ))}
      {filterOptions?.length > visibleFilterCount && (
        <Chip
          label={`+${String(filterOptions?.length - visibleFilterCount)}`}
          sx={{
            flexDirection: "row",
            border: "0.0625rem solid",
            borderColor: theme.palette.grey[500],
            backgroundColor: theme.palette.grey[100],
            color: theme.palette.text.secondary,
            paddingX: "0.5rem"
          }}
        />
      )}
    </>
  );
};

export default ShowSelectedFilters;
