package com.skapp.community.leaveplanner.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum LeaveMessageConstant implements MessageConstant {

	LEAVE_SUCCESS_NUDGE_MANAGER("api.success.leave.nudge-manager"),
	LEAVE_SUCCESS_AUTO_APPROVAL_LEAVE_APPROVED("api.success.leave.auto-approval-leave-approved"),

	LEAVE_ERROR_LEAVE_CYCLE_NOT_FOUND("api.error.leave.leave-cycle.not-found"),
	LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_FOUND("api.error.leave.leave-entity.not-found"),
	LEAVE_ERROR_ENTITLEMENT_IN_USE_CANT_DELETED("api.error.leave.leave-entitlement.in-use-cant.deleted"),
	LEAVE_ERROR_NUMBER_OF_DAYS_NOT_VALID("api.error.leave.leave-number-of-days-not-valid"),
	LEAVE_ERROR_INVALID_DAYS_OFF_ALLOCATION("api.error.leave.error-invalid-days-off-allocation"),
	LEAVE_ERROR_LEAVE_TYPE_NOT_FOUND("api.error.leave.leave-type-not-found"),
	LEAVE_ERROR_LEAVE_ENTITLEMENT_CARRY_FORWARD_SUCCESSFUL("api.error.leave.leave-carry-forward-successful"),
	LEAVE_ERROR_CARRY_FORWARD_YEAR_NOT_VALID("api.error.leave.error-carry-forward-year-not-valid"),
	LEAVE_ERROR_LEAVE_TYPE_IN_BULK_NOT_FOUND("api.error.leave.type-in-bulk-not-found"),
	USER_IN_BULK_NOT_FOUND("api.error.user-in-bulk-not-found"),
	LEAVE_ERROR_GUEST_USER_NOT_ALLOWED("api.error.leave.guest-user-not-allowed"),
	LEAVE_ERROR_START_DATE_END_DATE_NOT_VALID("api.error.leave.start-date-end-date-not-valid"),
	LEAVE_ERROR_REPORT_YEAR_NOT_VALID("api.error.leave.report-year-not-valid"),
	LEAVE_ERROR_MUST_INCLUDE_ATTACHMENT("api.error.leave.must-include-attachment"),
	LEAVE_ERROR_MUST_INCLUDE_COMMENT("api.error.leave.must-include-comment"),
	LEAVE_ERROR_CANNOT_APPLY_HALFDAY_FOR_LEAVE_TYPE("api.error.leave.cannot-apply-halfday-for-leave-type"),
	LEAVE_ERROR_CANNOT_APPLY_FULLDAY_FOR_LEAVE_TYPE("api.error.leave.cannot-apply-fullday-for-leave-type"),
	LEAVE_ERROR_LEAVE_TYPE_INACTIVE("api.error.leave.leave-type-inactive"),
	LEAVE_ERROR_LEAVE_REQUEST_NOT_VALID_DATE_RANGE("api.error.leave.leave-request-not-valid-date-range"),
	LEAVE_ERROR_LEAVE_REQUEST_OVERLAP("api.error.leave.leave-request-overlap"),
	LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_SUFFICIENT("api.error.leave.leave-entitlement-not-sufficient"),
	LEAVE_ERROR_LEAVE_ENTITLEMENT_UTILIZE_MORE_THAN_NEW_COUNT(
			"api.error.leave.leave-entitlement-utilize-more-than-new-count"),
	LEAVE_ERROR_LEAVE_REQUEST_DESCRIPTION_PASSED_MAX_LENGTH(
			"api.error.leave.leave-request-description-passed-max-length"),
	LEAVE_ERROR_LEAVE_CYCLE_CONFIG_NOT_FOUND("api.error.leave.leave-cycle-config-not-found"),
	LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_APPLICABLE("api.error.leave.leave-entitlement-not-applicable"),
	LEAVE_ERROR_NOT_VALID_LEAVE_REQUEST("api.error.leave.not-valid-leave-request"),
	LEAVE_ERROR_LEAVE_REQUEST_NOT_FOUND("api.error.leave.leave-request-not-found"),
	LEAVE_ERROR_INFORMANT_CANNOT_UPDATE_LEAVE_REQUEST("api.error.leave.informant-cannot-update-leave-request"),
	LEAVE_ERROR_INVALID_LEAVE_REQUEST_STATUS_MANAGER("api.error.leave.invalid-leave-request-status-manager"),
	LEAVE_ERROR_LEAVE_TYPE_UNABLE_TO_MAKE_ATTACHMENT_MANDATORY(
			"api.error.leave.leave-type-unable-to-make-attachment-mandatory"),
	LEAVE_ERROR_LEAVE_TYPE_ALREADY_EXISTS("api.error.leave.leave-type-already-exists"),
	LEAVE_ERROR_LEAVE_TYPE_EMOJI_EXISTS("api.error.leave.leave-type-emoji-exists"),
	LEAVE_ERROR_LEAVE_REQUEST_UPDATE_START_DATE_NOT_MATCH("api.error.leave.leave-request-update-start-date-not-match"),
	LEAVE_ERROR_LEAVE_REQUEST_UPDATE_END_DATE_NOT_MATCH("api.error.leave.leave-request-update-end-date-not-match"),
	LEAVE_ERROR_LEAVE_REQUEST_UPDATE_ON_SAME_STATUS("api.error.leave.leave-request-update-on-same-status"),
	LEAVE_ERROR_INVALID_LEAVE_REQUEST_STATUS_EMPLOYEE("api.error.leave.invalid-leave-request-status-employee"),
	LEAVE_ERROR_LEAVE_REQUEST_DATE_RANGE_REQUIRED("api.error.leave.leave-request-date-range-required"),
	LEAVE_ERROR_LEAVE_REQUEST_DATE_RANGE_INVALID("api.error.leave.leave-request-date-range-invalid"),
	LEAVE_ERROR_NO_MANAGER_FOUND("api.error.leave.no-manager-found"),
	LEAVE_ERROR_INVALID_YEAR_MONTH("api.error.leave.invalid-year-month"),
	LEAVE_ERROR_CANNOT_SET_CARRY_FORWARD_DAYS_IF_CARRY_FORWARD_DISABLED(
			"api.error.leave.cannot-set-carry-forward-days-if-carry-forward-disabled"),
	LEAVE_ERROR_UNABLE_TO_NUDGE_PRE_APPROVED_DENIED_LEAVE_REQUEST(
			"api.error.leave.unable-to-nudge-pre-approved-denied-leave-request"),
	LEAVE_ERROR_PARSING_LEAVE_CYCLE_DATA("api.error.leave.parsing-leave-cycle-data"),
	LEAVE_ERROR_MAX_CARRY_FORWARD_DAYS_EXCEEDS_LIMIT("api.error.leave.max-carry-forward-days-exceeds-limit"),
	LEAVE_ERROR_NUMBER_OF_DAYS_CANNOT_BE_LESS_THAN_USED_DAYS(
			"api.error.leave.number-of-days-cannot-be-less-than-used-days"),
	LEAVE_ERROR_LEAVE_POLICY_ALREADY_EXISTS("api.error.leave.leave-policy-already-exists"),
	LEAVE_ERROR_POLICY_LEAVE_TYPE_NOT_FOUND("api.error.leave.policy-leave-type-not-found"),
	LEAVE_ERROR_LEAVE_POLICY_NAME_REQUIRED("api.error.leave.leave-policy-name-required"),
	LEAVE_ERROR_LEAVE_POLICY_NAME_MAX_LENGTH_EXCEEDED("api.error.leave.leave-policy-name-max-length-exceeded"),
	LEAVE_ERROR_LEAVE_POLICY_LEAVE_TYPE_REQUIRED("api.error.leave.leave-policy-leave-type-required"),
	LEAVE_ERROR_LEAVE_POLICY_POLICY_TYPE_REQUIRED("api.error.leave.leave-policy-policy-type-required"),
	LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_CONFIG_REQUIRED("api.error.leave.leave-policy-accrual-config-required"),
	LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_CONFIG_NOT_ALLOWED("api.error.leave.leave-policy-accrual-config-not-allowed"),
	LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_DAYS_INVALID("api.error.leave.leave-policy-accrual-days-invalid"),
	LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_FREQUENCY_REQUIRED("api.error.leave.leave-policy-accrual-frequency-required"),
	LEAVE_ERROR_LEAVE_POLICY_WAITING_PERIOD_INVALID("api.error.leave.leave-policy-waiting-period-invalid"),
	LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_CAP_INVALID("api.error.leave.leave-policy-accrual-cap-invalid"),
	LEAVE_ERROR_LEAVE_POLICY_CARRYOVER_DATE_REQUIRED("api.error.leave.leave-policy-carryover-date-required"),
	LEAVE_ERROR_LEAVE_POLICY_CARRYOVER_DATE_INVALID("api.error.leave.leave-policy-carryover-date-invalid"),
	LEAVE_ERROR_LEAVE_POLICY_MAX_CARRYOVER_DAYS_INVALID("api.error.leave.leave-policy-max-carryover-days-invalid"),
	LEAVE_ERROR_LEAVE_POLICY_NOT_FOUND("api.error.leave.leave-policy-not-found"),
	LEAVE_ERROR_LEAVE_POLICY_NOT_ACTIVE("api.error.leave.leave-policy-not-active"),
	LEAVE_ERROR_EMPLOYEE_NOT_FOUND("api.error.leave.employee-not-found"),
	LEAVE_ERROR_LEAVE_POLICY_SPECIFIC_DATE_REQUIRED("api.error.leave.leave-policy-specific-date-required"),
	LEAVE_ERROR_LEAVE_POLICY_HIRE_DATE_UNAVAILABLE("api.error.leave.leave-policy-hire-date-unavailable"),
	LEAVE_ERROR_LEAVE_POLICY_NOT_ACCRUAL("api.error.leave.leave-policy-not-accrual"),
	LEAVE_ERROR_EMPLOYEE_LEAVE_POLICY_NOT_FOUND("api.error.leave.employee-leave-policy-not-found"),
	LEAVE_ERROR_LEAVE_POLICY_ALREADY_ENABLED("api.error.leave.leave-policy-already-enabled"),
	LEAVE_ERROR_LEAVE_POLICY_ALREADY_INACTIVE("api.error.leave.leave-policy-already-inactive"),
	LEAVE_ERROR_LEAVE_POLICY_ALREADY_ACTIVE("api.error.leave.leave-policy-already-active"),
	LEAVE_ERROR_POLICY_LEAVE_NOT_ENABLED("api.error.leave.policy-leave-not-enabled"),
	LEAVE_ERROR_POLICY_LEAVE_POLICY_NOT_ASSIGNED("api.error.leave.policy-leave-policy-not-assigned"),
	LEAVE_ERROR_POLICY_LEAVE_POLICY_INACTIVE("api.error.leave.policy-leave-policy-inactive"),
	LEAVE_ERROR_POLICY_LEAVE_TYPE_INACTIVE("api.error.leave.policy-leave-type-inactive"),
	LEAVE_ERROR_POLICY_LEAVE_INVALID_DATE_RANGE("api.error.leave.policy-leave-invalid-date-range"),
	LEAVE_ERROR_POLICY_LEAVE_OUTSIDE_POLICY_PERIOD("api.error.leave.policy-leave-outside-policy-period"),
	LEAVE_ERROR_POLICY_LEAVE_NOT_APPLICABLE("api.error.leave.policy-leave-not-applicable"),
	LEAVE_ERROR_POLICY_LEAVE_REQUEST_OVERLAP("api.error.leave.policy-leave-request-overlap"),
	LEAVE_ERROR_POLICY_LEAVE_INSUFFICIENT_BALANCE("api.error.leave.policy-leave-insufficient-balance"),
	LEAVE_ERROR_POLICY_LEAVE_MUST_INCLUDE_COMMENT("api.error.leave.policy-leave-must-include-comment"),
	LEAVE_ERROR_POLICY_LEAVE_MUST_INCLUDE_ATTACHMENT("api.error.leave.policy-leave-must-include-attachment"),
	LEAVE_ERROR_POLICY_LEAVE_CANNOT_APPLY_HALFDAY("api.error.leave.policy-leave-cannot-apply-halfday"),
	LEAVE_ERROR_POLICY_LEAVE_CANNOT_APPLY_FULLDAY("api.error.leave.policy-leave-cannot-apply-fullday"),
	LEAVE_ERROR_POLICY_LEAVE_DESCRIPTION_MAX_LENGTH("api.error.leave.policy-leave-description-max-length"),
	LEAVE_ERROR_POLICY_LEAVE_INVALID_YEAR("api.error.leave.policy-leave-invalid-year"),
	LEAVE_ERROR_POLICY_LEAVE_HALFDAY_SINGLE_DATE_ONLY("api.error.leave.policy-leave-halfday-single-date-only"),
	LEAVE_ERROR_POLICY_LEAVE_TOO_MANY_ATTACHMENTS("api.error.leave.policy-leave-too-many-attachments");

	private final String messageKey;

}
