import { FormikErrors } from "formik";
import { ChangeEvent } from "react";
import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import type { useTranslator } from "~community/common/hooks/useTranslator";
import type useGetPriorityOptions from "../hooks/useGetPriorityOptions";
import type useGetTaskTypeOptions from "../hooks/useGetTaskTypeOptions";
import { CrmTaskAddFormTypes, CrmOwner, CrmTaskCategory } from "./CommonTypes";

export interface TaskFormTemplateProps {
  // Formik values & methods
  values: CrmTaskAddFormTypes;
  errors: FormikErrors<CrmTaskAddFormTypes>;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  setFieldValue: (
    field: string,
    value: unknown,
    shouldValidate?: boolean
  ) => void;
  isSubmitting: boolean;
  isPending: boolean;

  // Owner
  selectedOwner: CrmOwner | null;
  ownerSearchText: string;
  ownerDropdownItems: SearchableDropdownItem[];
  onOwnerSelect: (item: SearchableDropdownItem) => void;
  onOwnerSearchChange: (value: string) => void;
  onOwnerRemove: () => void;
  isOwnerFetching: boolean;
  isCrmSalesManager: boolean | undefined;

  // Contact
  selectedContactLabel: string;
  contactSearchText: string;
  contactDropdownItems: SearchableDropdownItem[];
  onContactSelect: (item: SearchableDropdownItem) => void;
  onContactSearchChange: (value: string) => void;
  onClearContact: () => void;
  isContactFetching: boolean;

  // Deal
  selectedDealLabel: string;
  dealSearchText: string;
  dealDropdownItems: SearchableDropdownItem[];
  onDealSelect: (item: SearchableDropdownItem) => void;
  onDealSearchChange: (value: string) => void;
  onClearDeal: () => void;
  isDealFetching: boolean;

  // Options
  priorityOptions: ReturnType<typeof useGetPriorityOptions>;
  taskTypeOptions: {
    options: ReturnType<typeof useGetTaskTypeOptions>["options"];
    getCategoryById: (id: number) => CrmTaskCategory | undefined;
  };

  // Actions
  onSubmit: () => void;
  onCancel: () => void;

  translateText: ReturnType<typeof useTranslator>;
}
