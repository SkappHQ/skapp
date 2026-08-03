import {
  Box,
  Container,
  Stack,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import CustomLeaveAllocationsTable from "~community/leave/components/molecules/CustomLeaveAllocationsTable/CustomLeaveAllocationsTable";
import CustomLeaveModalController from "~community/leave/components/organisms/CustomLeaveModalController/CustomLeaveModalController";
import { useLeaveStore } from "~community/leave/store/store";
import { CustomLeaveAllocationModalTypes } from "~community/leave/types/CustomLeaveAllocationTypes";

import styles from "./styles";

const CustomLeaveAllocationContent: FC = () => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateText = useTranslator("leaveModule", "customLeave");
  const {
    setCustomLeaveAllocationModalType,
    setIsLeaveAllocationModalOpen,
    customLeaveAllocations
  } = useLeaveStore((state) => state);

  const [customLeaveAllocationSearchTerm, setCustomLeaveAllocationSearchTerm] =
    useState<string | undefined>(undefined);
  const [showAddButton, setShowAddButton] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [hasEmptyFilterResults, setHasEmptyFilterResults] = useState(false);

  useEffect(() => {
    const hasData = customLeaveAllocations && customLeaveAllocations.length > 0;
    const hasSearchTerm =
      customLeaveAllocationSearchTerm !== undefined &&
      customLeaveAllocationSearchTerm.trim() !== "";

    if (hasEmptyFilterResults) {
      setShowAddButton(false);
      return;
    }

    if (!hasData && !hasSearchTerm && !isFilterActive) {
      setShowAddButton(true);
      return;
    }

    setShowAddButton(!hasData);
  }, [
    customLeaveAllocations,
    customLeaveAllocationSearchTerm,
    isFilterActive,
    hasEmptyFilterResults
  ]);

  const handleAddAllocation = () => {
    setIsLeaveAllocationModalOpen(true);
    setCustomLeaveAllocationModalType(
      CustomLeaveAllocationModalTypes.ADD_LEAVE_ALLOCATION
    );
  };

  const handleSearchTermChange = (term: string) => {
    setCustomLeaveAllocationSearchTerm(term);
    setIsFilterActive(true);
  };

  return (
    <Container disableGutters maxWidth={false}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" sx={{ flex: 1 }}>
          <Typography sx={classes.titleText} variant="h1">
            {translateText(["CustomLeaveAllocationsSectionTitle"])}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          sx={{ flex: 1, justifyContent: "flex-end" }}
        >
          {!showAddButton && (
            <ButtonV2
              variant={"primary"}
              onClick={handleAddAllocation}
              icon={<Icon name={IconName.ADD_ICON} />}
              iconPosition="end"
            >
              {translateText(["addLeaveAllocationBtn"])}
            </ButtonV2>
          )}
        </Stack>
      </Stack>

      <Box>
        <CustomLeaveAllocationsTable
          searchTerm={customLeaveAllocationSearchTerm}
          onSearchTermChange={handleSearchTermChange}
          setHasEmptyFilterResults={setHasEmptyFilterResults}
        />
        <CustomLeaveModalController />
      </Box>
    </Container>
  );
};

export default CustomLeaveAllocationContent;
