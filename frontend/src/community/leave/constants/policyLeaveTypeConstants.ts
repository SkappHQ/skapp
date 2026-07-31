/**
 * TEMPORARY MOCK.
 *
 * The leave policy feature flag is persisted in organization config and will be
 * exposed by `GET /v1/leave/policies/config` in a separate PR. Until then this
 * constant stands in for it, so the old/new leave type switch can be built and
 * reviewed.
 *
 * TODO: remove this constant and back `useIsLeavePoliciesEnabled` with the real
 * config query once the endpoint is available.
 */
export const IS_LEAVE_POLICIES_ENABLED_MOCK = true;

export const MAX_POLICY_LEAVE_TYPE_NAME_LENGTH = 100;

export const POLICY_LEAVE_TYPES_PAGE_SIZE = 20;
