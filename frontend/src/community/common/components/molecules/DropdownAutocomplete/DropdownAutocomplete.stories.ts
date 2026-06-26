import type { Meta, StoryObj } from "@storybook/react";

import DropdownAutocomplete from "./DropdownAutocomplete";

const meta: Meta<typeof DropdownAutocomplete> = {
  title: "components/molecules/DropdownAutocomplete",
  component: DropdownAutocomplete,
  tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof DropdownAutocomplete>;

export const Primary: Story = {
  args: {
    label: "Country",
    inputName: "country",
    itemList: [
      { label: "Sri Lanka", value: "Sri Lanka" },
      { label: "India", value: "India" }
    ]
  }
};
