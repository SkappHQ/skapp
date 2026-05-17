import {
  ButtonV2,
  Dropdown,
  InputField,
  SidePanel,
  TextArea
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/Dropdown/Dropdown";
import PlusIcon from "~community/common/assets/Icons/PlusIcon";
import { useFormik } from "formik";
import {
  FC,
  ReactNode,
  useMemo,
  useState
} from "react";
import * as Yup from "yup";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCreateDeal, useGetDealStages, useGetPriorities } from "~community/crm/api/crmDealApi";
import PeoplePopupSearch from "~community/crm/components/molecules/PeoplePopupSearch/PeoplePopupSearch";
import PriorityDropdown from "~community/crm/components/molecules/PriorityDropdown/PriorityDropdown";
import {
  MOCK_COMPANIES,
  MOCK_CONTACTS
} from "~community/crm/api/utils/mockDealData";
import { CrmOwnerType } from "~community/crm/types/CommonTypes";
import { useAppStore } from "../../../../../store/store";

const MOCK_OWNERS: CrmOwnerType[] = [
  { employeeId: 1, firstName: "Anusha",  lastName: "Mahindarathne",  authPic: null },
  { employeeId: 2, firstName: "Person1", lastName: "Person1",        authPic: null },
  { employeeId: 3, firstName: "CRM",     lastName: "Admin",          authPic: null },
  { employeeId: 4, firstName: "CRM",     lastName: "Manager",        authPic: null },
  { employeeId: 5, firstName: "CRM",     lastName: "Representative", authPic: null }
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AddDealFormValues {
  name: string;
  description: string;
  stageId: string;
  contactId: string;
  ownerId: string;
  ownerName: string;
  priorityId: string;
  amount: string;
  companyId: string;
}

const getOptionLabel = (options: DropdownOption[], value: string): string => {
  if (!value) return "";
  const opt = options.find((o) => o.value === value || o.id === value);
  if (!opt) return "";
  return typeof opt.label === "string" ? opt.label : "";
};
// ---------------------------------------------------------------------------
// PropertyRow — shared row shell (layout only, no raw interactive elements)
// ---------------------------------------------------------------------------

const PropertyRow: FC<{ label: string; children: ReactNode }> = ({
  label,
  children
}) => (
  <div className="flex w-full items-center gap-4 min-h-[44px]">
    <div className="w-[120px] shrink-0 flex items-center">
      <span className="text-[14px] font-medium text-black whitespace-nowrap">{label}</span>
    </div>
    <div className="flex-1 min-w-0 flex items-center">
      {children}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// AddDealSidePanel
// ---------------------------------------------------------------------------

const AddDealSidePanel: FC = () => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");
  const [editingField, setEditingField] = useState<string | null>(null);

  const { isSidePanelOpen, closeSidePanel } = useAppStore((state) => ({
    isSidePanelOpen: state.isSidePanelOpen,
    closeSidePanel: state.closeSidePanel
  }));

  // ---------- stages and priorities from API ----------
  const { data: stages = [] } = useGetDealStages();
  const { data: priorities = [] } = useGetPriorities();

  const stageOptions = useMemo<DropdownOption[]>(
    () =>
      stages.map((s) => ({
        id: String(s.id),
        value: String(s.id),
        label: (
          <div className="inline-flex items-center gap-2.5">
            <div
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: s.color ?? "#6B7280" }}
            />
            <span className="body2">{s.name}</span>
          </div>
        )
      })),
    [stages]
  );

  const contactOptions = useMemo<DropdownOption[]>(
    () =>
      MOCK_CONTACTS.map((c) => ({
        id: String(c.id),
        label: c.name,
        value: String(c.id)
      })),
    []
  );

  const companyOptions = useMemo<DropdownOption[]>(
    () =>
      MOCK_COMPANIES.map((co) => ({
        id: String(co.id),
        label: co.name,
        value: String(co.id)
      })),
    []
  );

  // ---------------------------------------------------------------------------------------

  const validationSchema = Yup.object({
    name: Yup.string().trim().required(translateText(["dealNameRequired"])),
    stageId: Yup.string().required(translateText(["stageRequired"])),
    contactId: Yup.string().required(translateText(["contactRequired"])),
    ownerId: Yup.string().required(translateText(["ownerRequired"]))
  });

  const { mutate: createDeal } = useCreateDeal(
    () => {
      formik.resetForm();
      setEditingField(null);
      closeSidePanel();
    },
    () => {}
  );

  const formik = useFormik<AddDealFormValues>({
    initialValues: {
      name: "",
      description: "",
      stageId: "",
      contactId: "",
      ownerId: "",
      ownerName: "",
      priorityId: "",
      amount: "",
      companyId: ""
    },
    validationSchema,
    onSubmit: (values) => {
      createDeal({
        name: values.name.trim(),
        stageId: Number(values.stageId),
        contactId: Number(values.contactId),
        ownerId: Number(values.ownerId),
        ...(values.priorityId && { priorityId: Number(values.priorityId) }),
        ...(values.amount && { amount: values.amount }),
        ...(values.companyId && { companyId: Number(values.companyId) })
      });
    }
  });

  const handleClose = () => {
    formik.resetForm();
    setEditingField(null);
    closeSidePanel();
  };

  const selectedOwner = useMemo<CrmOwnerType | null>(
    () =>
      !formik.values.ownerId
        ? null
        : (MOCK_OWNERS.find((u) => String(u.employeeId) === formik.values.ownerId) ?? null),
    [formik.values.ownerId]
  );

  return (
    <SidePanel
      isOpen={isSidePanelOpen}
      onClose={handleClose}
      header={<span className="pl-2 text-2xl font-bold text-black">{translateText(["title"])}</span>}
      width="lg"
      animation="slide"
      closeOnBackdropClick
      closeAriaLabel="Close add deal panel"
      footer={
        <div className="flex justify-end px-6 py-3">
          <ButtonV2
            variant="primary"
            size="md"
            onClick={() => formik.handleSubmit()}
            disabled={formik.isSubmitting}
            icon={<PlusIcon fill="black" />}
            iconPosition="end"
          >
            {translateText(["addDealBtn"])}
          </ButtonV2>
        </div>
      }
    >
      <div className="flex gap-6 items-start h-full">
        {/* ── Left column ── */}
        <div className="flex-[2_1_0] min-w-0 flex flex-col gap-6">
          <InputField
            label={translateText(["dealNameLabel"])}
            placeholder={translateText(["dealNamePlaceholder"])}
            required
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            state={formik.touched.name && formik.errors.name ? "error" : "default"}
            errorMessage={formik.touched.name && formik.errors.name ? formik.errors.name : undefined}
            fullWidth
          />
          <TextArea
            label={translateText(["descriptionLabel"])}
            placeholder={translateText(["descriptionPlaceholder"])}
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            rows={6}
          />
        </div>

        {/* ── Right column ── */}
        <div className="flex-[1_0_0] min-w-0 flex flex-col gap-4">
          {/* Stage */}
          <Dropdown
            options={stageOptions}
            value={formik.values.stageId}
            onChange={(v) => formik.setFieldValue("stageId", v)}
            variant="jsx-content"
            className="rounded-lg"
            width="219px"
            placeholder={translateText(["stageLabel"])}
            errorMessage={
              formik.touched.stageId && formik.errors.stageId
                ? formik.errors.stageId
                : undefined
            }
          />

          {/* Property rows — bordered card with click-to-edit */}
          <div className="border border-[#E5E7EB] rounded-lg p-3 flex flex-col gap-2 w-full">

            {/* Value — click to edit */}
            <PropertyRow label={translateText(["valueLabel"])}>
              {editingField === "amount" ? (
                <div
                  className="flex-1 min-w-0"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null))
                      setEditingField(null);
                  }}
                >
                  <InputField
                    name="amount"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={translateText(["amountPlaceholder"])}
                    variant="sm"
                    fullWidth
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className={`text-[14px] text-left w-full pl-1 ${
                    formik.values.amount ? "text-[#111827]" : "text-[#9CA3AF]"
                  }`}
                  onClick={() => setEditingField("amount")}
                >
                  {formik.values.amount || translateText(["noneText"])}
                </button>
              )}
            </PropertyRow>

            {/* Priority */}
            <PropertyRow label={translateText(["priorityLabel"])}>
              <PriorityDropdown
                priorities={priorities}
                value={formik.values.priorityId}
                onChange={(v) => formik.setFieldValue("priorityId", v)}
                placeholder={translateText(["noneText"])}
              />
            </PropertyRow>

            {/* Owned by */}
            <PropertyRow label={translateText(["ownedByLabel"])}>
              <div className="flex flex-col w-full">
                <PeoplePopupSearch
                  users={MOCK_OWNERS}
                  selectedUser={selectedOwner}
                  onChange={(user) => {
                    formik.setFieldValue("ownerId", user ? String(user.employeeId) : "");
                    formik.setFieldValue(
                      "ownerName",
                      user
                        ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
                        : ""
                    );
                  }}
                  placeholder={translateText(["noneText"])}
                  ariaInvalid={!!(formik.touched.ownerId && formik.errors.ownerId)}
                  ariaErrorMessage={
                    formik.touched.ownerId && formik.errors.ownerId
                      ? formik.errors.ownerId
                      : undefined
                  }
                />
                {formik.touched.ownerId && formik.errors.ownerId && (
                  <p className="text-[#DC2626] text-[12px] mt-1">
                    {formik.errors.ownerId}
                  </p>
                )}
              </div>
            </PropertyRow>

            {/* Contact name — click to edit */}
            <PropertyRow label={translateText(["contactNameLabel"])}>
              {editingField === "contactId" ? (
                <div
                  className="flex-1 min-w-0"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null))
                      setEditingField(null);
                  }}
                >
                  <Dropdown
                    options={contactOptions}
                    value={formik.values.contactId}
                    onChange={(v) => {
                      formik.setFieldValue("contactId", v);
                      setEditingField(null);
                    }}
                    width="100%"
                    placeholder={translateText(["noneText"])}
                    padding="py-1 px-3"
                    errorMessage={
                      formik.touched.contactId && formik.errors.contactId
                        ? formik.errors.contactId
                        : undefined
                    }
                  />
                </div>
              ) : (
                <div className="flex flex-col w-full">
                  <button
                    type="button"
                    className={`text-[14px] text-left w-full pl-1 ${
                      formik.touched.contactId && formik.errors.contactId
                        ? "text-[#DC2626]"
                        : formik.values.contactId ? "text-[#111827]" : "text-[#9CA3AF]"
                    }`}
                    onClick={() => setEditingField("contactId")}
                  >
                    {getOptionLabel(contactOptions, formik.values.contactId) ||
                      translateText(["noneText"])}
                  </button>
                  {formik.touched.contactId && formik.errors.contactId && (
                    <p className="text-[#DC2626] text-[12px] mt-1">
                      {formik.errors.contactId}
                    </p>
                  )}
                </div>
              )}
            </PropertyRow>

            {/* Company name — click to edit */}
            <PropertyRow label={translateText(["companyNameLabel"])}>
              {editingField === "companyId" ? (
                <div
                  className="flex-1 min-w-0"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null))
                      setEditingField(null);
                  }}
                >
                  <Dropdown
                    options={companyOptions}
                    value={formik.values.companyId}
                    onChange={(v) => {
                      formik.setFieldValue("companyId", v);
                      setEditingField(null);
                    }}
                    width="100%"
                    placeholder={translateText(["noneText"])}
                    padding="py-1 px-3"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className={`text-[14px] text-left w-full pl-1 ${
                    formik.values.companyId ? "text-[#111827]" : "text-[#9CA3AF]"
                  }`}
                  onClick={() => setEditingField("companyId")}
                >
                  {getOptionLabel(companyOptions, formik.values.companyId) ||
                    translateText(["noneText"])}
                </button>
              )}
            </PropertyRow>
          </div>
        </div>
      </div>
    </SidePanel>
  );
};

export default AddDealSidePanel;