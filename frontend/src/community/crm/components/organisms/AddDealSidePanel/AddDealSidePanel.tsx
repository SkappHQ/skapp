import {
  ButtonV2,
  Dropdown,
  DropdownWithSearchablePopup,
  InputField,
  SidePanel,
  TextArea
} from "@rootcodelabs/skapp-ui";
import PlusIcon from "~community/common/assets/Icons/PlusIcon";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/Dropdown/Dropdown";
import type { DropdownOption as SearchableDropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/DropdownWithSearchablePopup/DropdownWithSearchablePopup";
import { useFormik } from "formik";
import {
  FC,
  ReactNode,
  useEffect,
  useMemo,
  useState
} from "react";
import * as Yup from "yup";

import { useAuth } from "~community/auth/providers/AuthProvider";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  AdminTypes,
  ManagerTypes as AuthManagerTypes,
  RepresentativeTypes
} from "~community/common/types/AuthTypes";
import { useGetSearchedEmployees } from "~community/people/api/PeopleApi";
import {
  useCreateDeal,
  useGetCrmCompanies,
  useGetCrmContacts,
  useGetDealStages,
  useGetPriorities
} from "~community/crm/api/crmDealApi";
import { CrmDealStageEnum } from "~community/crm/enums/common";
import { useAppStore } from "../../../../../store/store";

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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAGE_FALLBACK_COLOR: Record<string, string> = {
  [CrmDealStageEnum.INITIAL]: "#3B82F6",
  [CrmDealStageEnum.OPEN]: "#F59E0B",
  [CrmDealStageEnum.WON]: "#10B981",
  [CrmDealStageEnum.LOST]: "#EF4444"
};

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
  <div className="flex w-full items-center gap-3 min-h-[44px]">
    <div className="w-[101px] shrink-0 flex items-center">
      <span className="text-[14px] font-medium text-black">{label}</span>
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
  const { user } = useAuth();

  // Owner search state — drives the 3 role-based API calls below
  const [ownerSearch, setOwnerSearch] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);

  const { isSidePanelOpen, closeSidePanel } = useAppStore((state) => ({
    isSidePanelOpen: state.isSidePanelOpen,
    closeSidePanel: state.closeSidePanel
  }));

  const { data: stages = [] } = useGetDealStages();
  const { data: priorities = [] } = useGetPriorities();

  // Owner: fetch CRM-role employees matching search term
  const { data: adminResults = [] } = useGetSearchedEmployees(
    ownerSearch,
    AdminTypes.CRM_ADMIN
  );
  const { data: managerResults = [] } = useGetSearchedEmployees(
    ownerSearch,
    AuthManagerTypes.CRM_SALES_MANAGER
  );
  const { data: repResults = [] } = useGetSearchedEmployees(
    ownerSearch,
    RepresentativeTypes.CRM_SALES_REPRESENTATIVE
  );
  const { data: contacts = [] } = useGetCrmContacts();
  const { data: companies = [] } = useGetCrmCompanies();

  const stageOptions = useMemo<DropdownOption[]>(
    () =>
      stages.map((s) => ({
        id: String(s.id),
        value: s.name,
        label: (
          <div className="inline-flex items-center gap-2.5">
            <div
              className="size-2 rounded-full shrink-0"
              style={{
                backgroundColor:
                  s.color || STAGE_FALLBACK_COLOR[s.stageType] || "#6B7280"
              }}
            />
            <span className="body2">{s.name}</span>
          </div>
        )
      })),
    [stages]
  );

  const priorityOptions = useMemo<DropdownOption[]>(
    () =>
      priorities.map((p) => ({
        id: String(p.id),
        label: p.name,
        value: String(p.id)
      })),
    [priorities]
  );

  const contactOptions = useMemo<DropdownOption[]>(
    () =>
      contacts.map((c) => ({
        id: String(c.id),
        label: c.name,
        value: String(c.id)
      })),
    [contacts]
  );

  const companyOptions = useMemo<DropdownOption[]>(
    () =>
      companies.map((co) => ({
        id: String(co.id),
        label: co.name,
        value: String(co.id)
      })),
    [companies]
  );

  // Owner options for DropdownWithSearchablePopup
  const ownerOptions = useMemo<SearchableDropdownOption[]>(() => {
    const combined = [...adminResults, ...managerResults, ...repResults];
    const seen = new Set<number>();
    return combined
      .filter((emp) => {
        if (seen.has(emp.employeeId)) return false;
        seen.add(emp.employeeId);
        return true;
      })
      .map((emp) => ({
        id: String(emp.employeeId),
        label: `${emp.firstName} ${emp.lastName ?? ""}`.trim(),
        value: String(emp.employeeId)
      }));
  }, [adminResults, managerResults, repResults]);

  const validationSchema = Yup.object({
    name: Yup.string().trim().required(translateText(["dealNameRequired"])),
    stageId: Yup.string().required(translateText(["stageRequired"])),
    contactId: Yup.string().required(translateText(["contactRequired"])),
    ownerId: Yup.string().required(translateText(["ownerRequired"]))
  });

  const { mutate: createDeal } = useCreateDeal(
    () => {
      formik.resetForm();
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
        stageId: Number(
          stages.find((s) => s.name === values.stageId)?.id ??
            values.stageId
        ),
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

  // Auto-select current user as owner when panel opens (or when user data arrives)
  useEffect(() => {
    if (
      isSidePanelOpen &&
      !formik.values.ownerId &&
      user?.employee?.employeeId
    ) {
      const name =
        `${user.employee.firstName} ${user.employee.lastName ?? ""}`.trim();
      formik.setFieldValue("ownerId", String(user.employee.employeeId));
      formik.setFieldValue("ownerName", name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSidePanelOpen, user?.employee?.employeeId]);

  // Derived owner value for DropdownWithSearchablePopup
  const ownerValue = useMemo<SearchableDropdownOption | null>(() => {
    if (!formik.values.ownerId) return null;
    return {
      id: formik.values.ownerId,
      label: formik.values.ownerName,
      value: formik.values.ownerId
    };
  }, [formik.values.ownerId, formik.values.ownerName]);

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
        {/* ── Left column ── — Figma: w-[637px], ~68% of content */}
        <div className="flex-[2_1_0] min-w-0 flex flex-col gap-6">
          <InputField
            label={translateText(["dealNameLabel"])}
            placeholder={translateText(["dealNamePlaceholder"])}
            required
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            state={
              formik.touched.name && formik.errors.name ? "error" : "default"
            }
            errorMessage={
              formik.touched.name && formik.errors.name
                ? formik.errors.name
                : undefined
            }
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

        {/* ── Right column ── — Figma: flex-[1_0_0], ~31% of content */}
        <div className="flex-[1_0_0] min-w-0 flex flex-col gap-4">
          {/* Stage — Figma: w-[219px] bg-[#f4f4f5] h-[48px] rounded-[8px] */}
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

          {/* Property rows — bordered card with click-to-edit (Figma node 775:50468) */}
          <div className="border border-[#E5E7EB] rounded-lg p-3 flex flex-col gap-2 w-full">

            {/* Value — click to edit */}
            <PropertyRow label={translateText(["valueLabel"])}>
              {editingField === "amount" ? (
                <div
                  className="flex-1 min-w-0"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                      setEditingField(null);
                    }
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
                  className={`text-[14px] text-left w-full ${
                    formik.values.amount ? "text-[#111827]" : "text-[#9CA3AF]"
                  }`}
                  onClick={() => setEditingField("amount")}
                >
                  {formik.values.amount || translateText(["noneText"])}
                </button>
              )}
            </PropertyRow>

            {/* Priority — click to edit */}
            <PropertyRow label={translateText(["priorityLabel"])}>
              {editingField === "priorityId" ? (
                <div
                  className="flex-1 min-w-0"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                      setEditingField(null);
                    }
                  }}
                >
                  <Dropdown
                    options={priorityOptions}
                    value={formik.values.priorityId}
                    onChange={(v) => {
                      formik.setFieldValue("priorityId", v);
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
                  className={`text-[14px] text-left w-full ${
                    formik.values.priorityId ? "text-[#111827]" : "text-[#9CA3AF]"
                  }`}
                  onClick={() => setEditingField("priorityId")}
                >
                  {getOptionLabel(priorityOptions, formik.values.priorityId) ||
                    translateText(["noneText"])}
                </button>
              )}
            </PropertyRow>

            {/* Owned by — click to edit */}
            <PropertyRow label={translateText(["ownedByLabel"])}>
              {editingField === "ownerId" ? (
                <div
                  className="flex-1 min-w-0"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                      setEditingField(null);
                    }
                  }}
                >
                  <DropdownWithSearchablePopup
                    options={ownerOptions}
                    value={ownerValue}
                    onChange={(v) => {
                      if (!v) {
                        formik.setFieldValue("ownerId", "");
                        formik.setFieldValue("ownerName", "");
                      } else if (typeof v !== "string" && typeof v !== "number") {
                        formik.setFieldValue("ownerId", String(v.id));
                        formik.setFieldValue(
                          "ownerName",
                          typeof v.label === "string" ? v.label : ""
                        );
                      }
                      setEditingField(null);
                    }}
                    onSearch={setOwnerSearch}
                    searchable
                    clearable
                    placeholder={translateText(["noneText"])}
                    searchPlaceholder="Search members..."
                    width="100%"
                    ariaInvalid={
                      !!(formik.touched.ownerId && formik.errors.ownerId)
                    }
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
              ) : (
                <button
                  type="button"
                  className={`text-[14px] text-left w-full ${
                    formik.values.ownerId ? "text-[#111827]" : "text-[#9CA3AF]"
                  }`}
                  onClick={() => setEditingField("ownerId")}
                >
                  {formik.values.ownerName || translateText(["noneText"])}
                </button>
              )}
            </PropertyRow>

            {/* Contact name — click to edit */}
            <PropertyRow label={translateText(["contactNameLabel"])}>
              {editingField === "contactId" ? (
                <div
                  className="flex-1 min-w-0"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                      setEditingField(null);
                    }
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
                <button
                  type="button"
                  className={`text-[14px] text-left w-full ${
                    formik.values.contactId ? "text-[#111827]" : "text-[#9CA3AF]"
                  }`}
                  onClick={() => setEditingField("contactId")}
                >
                  {getOptionLabel(contactOptions, formik.values.contactId) ||
                    translateText(["noneText"])}
                </button>
              )}
            </PropertyRow>

            {/* Company name — click to edit */}
            <PropertyRow label={translateText(["companyNameLabel"])}>
              {editingField === "companyId" ? (
                <div
                  className="flex-1 min-w-0"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                      setEditingField(null);
                    }
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
                  className={`text-[14px] text-left w-full ${
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