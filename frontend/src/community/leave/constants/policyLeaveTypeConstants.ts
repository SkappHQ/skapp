export const MAX_POLICY_LEAVE_TYPE_NAME_LENGTH = 100;

export const POLICY_LEAVE_TYPES_PAGE_SIZE = 20;

// The policy leave type list endpoint returns every record unpaginated when a
// negative size is sent, which is how lookups (dropdowns, filters) fetch all
// active types.
export const UNPAGINATED_SIZE = -1;

export const MIN_DURATION_ERROR_ID = "policy-leave-type-min-duration-error";

export const MIN_DURATION_GROUP_LABEL_ID =
  "policy-leave-type-min-duration-label";
