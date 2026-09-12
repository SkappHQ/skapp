import { FC } from "react";

interface AddNewCompanyOptionProps {
  label: string;
}

const AddNewCompanyOption: FC<AddNewCompanyOptionProps> = ({ label }) => (
  <span className="-mx-4 -my-2 flex items-center gap-2 rounded bg-primary-background px-4 py-2 text-primary-text">
    <span aria-hidden="true">+</span>
    {label}
  </span>
);

export default AddNewCompanyOption;
