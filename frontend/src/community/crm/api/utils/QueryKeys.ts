export const crmQueryKeys = {
  GET_CONTACTS: ["crm-contacts"],
  GET_CONTACT_BY_ID: (id: number) => ["crm-contact", id],
  GET_CONTACT_METRICS: (id: number) => ["crm-contact-metrics", id],
  GET_DEALS_BY_CONTACT: (id: number) => ["crm-contact-deals", id],
  GET_TASKS_BY_CONTACT: (id: number) => ["crm-contact-tasks", id]
};
