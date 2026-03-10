import { Stack } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import useFormChangeDetector from "~community/people/hooks/useFormChangeDetector";
import { usePeopleStore } from "~community/people/store/store";

interface Props {
  onCancelClick: () => void;
  onSaveClick: () => void;
}

const EditSectionButtonWrapper = ({ onCancelClick, onSaveClick }: Props) => {
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "commonText"
  );

  const { hasChanged } = useFormChangeDetector();

  const { profilePic } = usePeopleStore((state) => state);

  return (
    <Stack
      direction="row"
      justifyContent="flex-start"
      spacing={2}
      sx={{ padding: "1rem 0" }}
    >
      <ButtonV2
        variant={"tertiary"}
        fullWidth={false}
        onClick={onCancelClick}
        disabled={!hasChanged}
        icon={<Icon name={IconName.CLOSE_ICON} />}
        iconPosition="end"
      >
        {translateText(["cancel"])}
      </ButtonV2>
      <ButtonV2
        variant={"primary"}
        fullWidth={false}
        onClick={onSaveClick}
        disabled={!hasChanged && profilePic === null}
        icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
        iconPosition="end"
      >
        {translateText(["saveDetails"])}
      </ButtonV2>
    </Stack>
  );
};

export default EditSectionButtonWrapper;
