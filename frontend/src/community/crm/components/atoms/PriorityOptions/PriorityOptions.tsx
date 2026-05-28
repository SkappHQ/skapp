import { Label } from "@rootcodelabs/skapp-ui";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

export const getPriorityOptions = (translateText: TranslatorFunctionType) => [
  {
    id: "high",
    label: (
      <Label
        backgroundColor="bg-semantic-red-background"
        textColor="text-semantic-red-text"
      >
        {translateText(["priorityOptions", "high"])}
      </Label>
    ),
    value: "HIGH"
  },
  {
    id: "medium",
    label: (
      <Label
        backgroundColor="bg-semantic-amber-background"
        textColor="text-semantic-amber-text"
      >
        {translateText(["priorityOptions", "medium"])}
      </Label>
    ),
    value: "MEDIUM"
  },
  {
    id: "low",
    label: (
      <Label
        backgroundColor="bg-semantic-green-background"
        textColor="text-semantic-green-text"
      >
        {translateText(["priorityOptions", "low"])}
      </Label>
    ),
    value: "LOW"
  }
];
