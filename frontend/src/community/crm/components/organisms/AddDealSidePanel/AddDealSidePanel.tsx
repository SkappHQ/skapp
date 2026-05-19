import {
  ButtonV2,
  Dropdown,
  InputField,
  SidePanel,
  TextArea
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/Dropdown/Dropdown";
import { useFormik } from "formik";
import {
  FC,
  ReactNode,
  useEffect,
  useMemo,
  useState
} from "react";
import * as Yup from "yup";
import { useShallow } from "zustand/react/shallow";

import PlusIcon from "~community/common/assets/Icons/PlusIcon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateDeal, useGetCrmCompanies, useGetCrmContacts, useGetDealStages } from "~community/crm/api/crmDealApi";
import { CrmDealStageEnum } from "~community/crm/enums/common";
import CompanyPopupSearch from "~community/crm/components/molecules/CompanyPopupSearch/CompanyPopupSearch";
import ContactPopupSearch from "~community/crm/components/molecules/ContactPopupSearch/ContactPopupSearch";
import PeoplePopupSearch from "~community/crm/components/molecules/PeoplePopupSearch/PeoplePopupSearch";
import PriorityDropdown from "~community/crm/components/molecules/PriorityDropdown/PriorityDropdown";
import { CrmCompanyType, CrmContactType, CrmOwnerType } from "~community/crm/types/CommonTypes";
import { useGetSearchedEmployees } from "~community/people/api/PeopleApi";
import { useAppStore } from "~store/store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AddDealFormValues {
  name: string;
  stageId: string;
  contactId: string;
  ownerId: string;
  priority: string;
  amount: string;
  companyId: string;
  description: string;
}

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
  const { setToastMessage } = useToast();
  const [editingField, setEditingField] = useState<string | null>(null);

  const { isSidePanelOpen, closeSidePanel } = useAppStore(
    useShallow((state) => ({
      isSidePanelOpen: state.isSidePanelOpen,
      closeSidePanel: state.closeSidePanel
    }))
  );

  // ---------- stages, contacts, companies, and owner search from API ----------
  const { data: stages = [] } = useGetDealStages();
  const { data: contacts = [] } = useGetCrmContacts();
  const { data: companies = [] } = useGetCrmCompanies();

  const [ownerSearchTerm, setOwnerSearchTerm] = useState("");
  const { data: searchedEmployees = [] } = useGetSearchedEmployees(ownerSearchTerm);
  const owners = useMemo<CrmOwnerType[]>(
    () =>
      searchedEmployees.map((e) => ({
        employeeId: e.employeeId,
        firstName: e.firstName,
        lastName: e.lastName || null,
        authPic: e.authPic || null
      })),
    [searchedEmployees]
  );

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

  // ---------------------------------------------------------------------------------------

  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: Yup.string().trim().required(translateText(["dealNameRequired"])),
        stageId: Yup.string().required(translateText(["stageRequired"])),
        contactId: Yup.string().required(translateText(["contactRequired"])),
        ownerId: Yup.string().required(translateText(["ownerRequired"])),
        amount: Yup.string().test(
          "is-valid-amount",
          translateText(["amountInvalid"]),
          (value) => !value || (/^\d+(\.\d+)?$/.test(value) && Number(value) > 0)
        )
      }),
    [translateText]
  );

  const { mutate: createDeal } = useCreateDeal(
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["addDealSuccessTitle"]),
        description: translateText(["addDealSuccessDescription"])
      });
      formik.resetForm();
      setEditingField(null);
      closeSidePanel();
    },
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["addDealErrorTitle"]),
        description: translateText(["addDealErrorDescription"])
      });
    }
  );

  const formik = useFormik<AddDealFormValues>({
    initialValues: {
      name: "",
      stageId: "",
      contactId: "",
      ownerId: "",
      priority: "",
      amount: "",
      companyId: "",
      description: ""
    },
    validationSchema,
    onSubmit: (values) => {
      createDeal({
        name: values.name.trim(),
        stageId: Number(values.stageId),
        contactId: Number(values.contactId),
        ownerId: Number(values.ownerId),
        ...(values.priority && { priority: values.priority }),
        ...(values.amount && { amount: values.amount }),
        ...(values.companyId && { companyId: Number(values.companyId) }),
        ...(values.description && { description: values.description })
      });
    }
  });

  const handleClose = () => {
    formik.resetForm();
    setEditingField(null);
    closeSidePanel();
  };

  // Set default stage to Lead (INITIAL) once stages are fetched
  useEffect(() => {
    if (stages.length > 0 && !formik.values.stageId) {
      const leadStage = stages.find((s) => s.stageType === CrmDealStageEnum.INITIAL);
      if (leadStage) {
        formik.setFieldValue("stageId", String(leadStage.id));
      }
    }
  }, [stages, formik.values.stageId, formik.setFieldValue]);

  const selectedOwner = useMemo<CrmOwnerType | null>(
    () =>
      !formik.values.ownerId
        ? null
        : (owners.find((u) => String(u.employeeId) === formik.values.ownerId) ?? null),
    [formik.values.ownerId, owners]
  );

  const selectedContact = useMemo<CrmContactType | null>(
    () =>
      !formik.values.contactId
        ? null
        : (contacts.find((c) => String(c.id) === formik.values.contactId) ?? null),
    [formik.values.contactId, contacts]
  );

  const selectedCompany = useMemo<CrmCompanyType | null>(
    () =>
      !formik.values.companyId
        ? null
        : (companies.find((co) => String(co.id) === formik.values.companyId) ?? null),
    [formik.values.companyId, companies]
  );

  return (
    <div className="crm-deal-side-panel">
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={handleClose}
        header={<span className="pl-2 text-2xl font-bold text-black">{translateText(["title"])}</span>}
        width="xl"
        animation="slide"
        closeOnBackdropClick={!formik.dirty}
        closeAriaLabel={translateText(["closePanelAriaLabel"])}
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
            value={formik.values.description}
            onChange={(e) => formik.setFieldValue("description", e.target.value)}
            onBlur={formik.handleBlur}
            className="w-full h-[121px]"
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
                    type="number"
                    min="0"
                    step="0.01"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (["e", "E", "+", "-"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    variant="sm"
                    fullWidth
                    autoFocus
                    state={formik.touched.amount && formik.errors.amount ? "error" : "default"}
                    errorMessage={formik.touched.amount && formik.errors.amount ? formik.errors.amount : undefined}
                  />
                </div>
              ) : (
                <div className="flex flex-col w-full">
                  <button
                    type="button"
                    className={`text-[14px] text-left w-full pl-1 ${
                      formik.touched.amount && formik.errors.amount
                        ? "text-[#DC2626]"
                        : formik.values.amount ? "text-[#111827]" : "text-[#9CA3AF]"
                    }`}
                    onClick={() => setEditingField("amount")}
                  >
                    {formik.values.amount || translateText(["noneText"])}
                  </button>
                  {formik.touched.amount && formik.errors.amount && (
                    <p className="text-[#DC2626] text-[12px] mt-1">
                      {formik.errors.amount}
                    </p>
                  )}
                </div>
              )}
            </PropertyRow>

            {/* Priority */}
            <PropertyRow label={translateText(["priorityLabel"])}>
              <PriorityDropdown
                value={formik.values.priority}
                onChange={(v) => formik.setFieldValue("priority", v)}
                placeholder={translateText(["noneText"])}
              />
            </PropertyRow>

            {/* Owned by */}
            <PropertyRow label={translateText(["ownedByLabel"])}>
              <div className="flex flex-col w-full">
                <PeoplePopupSearch
                  users={owners}
                  selectedUser={selectedOwner}
                  onSearch={setOwnerSearchTerm}
                  onChange={(user) => {
                    formik.setFieldValue("ownerId", user ? String(user.employeeId) : "");
                  }}
                  placeholder={translateText(["noneText"])}
                  searchPlaceholder={translateText(["ownerSearchPlaceholder"])}
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

            {/* Contact name */}
            <PropertyRow label={translateText(["contactNameLabel"])}>
              <div className="flex flex-col w-full">
                <ContactPopupSearch
                  contacts={contacts}
                  selectedContact={selectedContact}
                  onChange={(c) =>
                    formik.setFieldValue("contactId", c ? String(c.id) : "")
                  }
                  placeholder={translateText(["noneText"])}
                  searchPlaceholder="Search contacts"
                  ariaInvalid={!!(formik.touched.contactId && formik.errors.contactId)}
                  ariaErrorMessage={
                    formik.touched.contactId && formik.errors.contactId
                      ? formik.errors.contactId
                      : undefined
                  }
                />
                {formik.touched.contactId && formik.errors.contactId && (
                  <p className="text-[#DC2626] text-[12px] mt-1">
                    {formik.errors.contactId}
                  </p>
                )}
              </div>
            </PropertyRow>

            {/* Company name */}
            <PropertyRow label={translateText(["companyNameLabel"])}>
              <CompanyPopupSearch
                companies={companies}
                selectedCompany={selectedCompany}
                onChange={(co) =>
                  formik.setFieldValue("companyId", co ? String(co.id) : "")
                }
                placeholder={translateText(["noneText"])}
                searchPlaceholder="Search companies"
              />
            </PropertyRow>
          </div>
        </div>
      </div>
      </SidePanel>
    </div>
  );
};

export default AddDealSidePanel;
