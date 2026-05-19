export const crmQueryKeys = {
  // Contacts
  CRM_CONTACTS: (params?: object) =>
    ["crm-contacts", params].filter((val) => val !== undefined),
  CRM_CONTACT_BY_ID: (id: number) => ["crm-contact", id],
  CRM_CONTACT_METRICS: (id: number) => ["crm-contact-metrics", id],
  CRM_CONTACT_DEALS: (contactId: number) => ["crm-contact-deals", contactId],
  CRM_CONTACT_TASKS: (contactId: number) => ["crm-contact-tasks", contactId],
  CRM_TASKS_BY_CONTACT: (contactId: number) => ["crm-tasks-by-contact", contactId],

  // Owners & Companies
  CRM_OWNERS: (params?: object) =>
    ["crm-owners", params].filter((val) => val !== undefined),
  CRM_COMPANIES: (params?: object) =>
    ["crm-companies", params].filter((val) => val !== undefined)
};
