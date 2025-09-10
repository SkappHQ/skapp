package com.skapp.community.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EmailBodyTemplates implements EmailTemplates {

	// People Module Templates
	PEOPLE_MODULE_USER_INVITATION_V1("people-module-user-invitation"),
	PEOPLE_MODULE_USER_INVITATION_GOOGLE_SSO("people-module-user-invitation-google-sso"),
	PEOPLE_MODULE_USER_INVITATION_MICROSOFT_SSO("people-module-user-invitation-microsoft-sso"),
	PEOPLE_MODULE_USER_TERMINATION_V1("people-module-user-termination"),

	// Holiday Templates
	PEOPLE_MODULE_NEW_HOLIDAY_DECLARED("people-module-new-holiday-declared-employee"),
	PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE(
			"people-module-holiday-single-day-pending-leave-request-canceled-employee"),
	PEOPLE_MODULE_HOLIDAY_MULTI_DAY_PENDING_LEAVE_REQUEST_UPDATED_EMPLOYEE(
			"people-module-holiday-multi-day-pending-leave-request-updated-employee"),
	PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE(
			"people-module-holiday-single-day-approved-leave-request-revoked-employee"),
	PEOPLE_MODULE_HOLIDAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_UPDATED_EMPLOYEE(
			"people-module-holiday-multi-day-approved-leave-request-updated-employee"),
	PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER(
			"people-module-holiday-single-day-pending-leave-request-canceled-manager"),
	PEOPLE_MODULE_HOLIDAY_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_UPDATED_MANAGER(
			"people-module-holiday-multi-day-pending-leave-request-updated-manager"),
	PEOPLE_MODULE_HOLIDAY_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER(
			"people-module-holiday-single-day-approved-leave-request-revoked-manager"),
	PEOPLE_MODULE_HOLIDAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_UPDATED_MANAGER(
			"people-module-holiday-multi-day-approved-leave-request-updated-manager"),
	PEOPLE_MODULE_PASSWORD_RESET_REQUEST_MANAGER("people-module-password-reset-request-manager"),

	// Attendance Module Templates

	// Non-Working Day Templates
	ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE(
			"attendance-module-non-working-day-single-day-pending-leave-request-canceled-employee"),
	ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE(
			"attendance-module-non-working-day-multi-day-pending-leave-request-canceled-employee"),
	ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE(
			"attendance-module-non-working-day-single-day-approved-leave-request-revoked-employee"),
	ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE(
			"attendance-module-non-working-day-multi-day-approved-leave-request-revoked-employee"),
	ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER(
			"attendance-module-non-working-day-single-day-pending-leave-request-canceled-manager"),
	ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER(
			"attendance-module-non-working-day-multi-day-pending-leave-request-canceled-manager"),
	ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER(
			"attendance-module-non-working-day-single-day-approved-leave-request-revoked-manager"),
	ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER(
			"attendance-module-non-working-day-multi-day-approved-leave-request-revoked-manager"),

	// Time Entry Templates
	ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_SUBMITTED_EMPLOYEE("attendance-module-time-entry-request-submitted-employee"),
	ATTENDANCE_MODULE_RECEIVED_TIME_ENTRY_REQUEST_MANAGER("attendance-module-received-time-entry-request-manager"),
	ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_APPROVED_EMPLOYEE("attendance-module-time-entry-request-approved-employee"),
	ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_DECLINED_EMPLOYEE("attendance-module-time-entry-request-declined-employee"),
	ATTENDANCE_MODULE_PENDING_TIME_ENTRY_REQUEST_CANCELLED_EMPLOYEE(
			"attendance-module-pending-time-entry-request-cancelled-employee"),
	ATTENDANCE_MODULE_PENDING_TIME_ENTRY_REQUEST_CANCELLED_MANAGER(
			"attendance-module-pending-time-entry-request-cancelled-manager"),
	ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_AUTO_APPROVED_EMPLOYEE(
			"attendance-module-time-entry-request-auto-approved-employee"),
	ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_AUTO_APPROVED_MANAGER(
			"attendance-module-time-entry-request-auto-approved-manager"),
	ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_APPROVED_OTHER_MANAGER(
			"attendance-module-time-entry-request-approved-other-manager"),
	ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_DECLINED_OTHER_MANAGER(
			"attendance-module-time-entry-request-declined-other-manager"),

	// Leave Module Templates
	LEAVE_MODULE_EMPLOYEE_APPLY_SINGLE_DAY_LEAVE("leave-module-employee-apply-single-day-leave"),
	LEAVE_MODULE_EMPLOYEE_APPLY_MULTIPLE_DAY_LEAVE("leave-module-employee-apply-multiple-day-leave"),
	LEAVE_MODULE_MANAGER_RECEIVED_SINGLE_DAY_LEAVE("leave-module-manager-received-single-day-leave"),
	LEAVE_MODULE_MANAGER_RECEIVED_MULTIPLE_DAY_LEAVE("leave-module-manager-received-multiple-day-leave"),
	LEAVE_MODULE_EMPLOYEE_CANCEL_SINGLE_DAY_LEAVE("leave-module-employee-cancel-single-day-leave"),
	LEAVE_MODULE_EMPLOYEE_CANCEL_MULTIPLE_DAY_LEAVE("leave-module-employee-cancel-multiple-day-leave"),
	LEAVE_MODULE_MANAGER_CANCEL_SINGLE_DAY_LEAVE("leave-module-manager-cancel-single-day-leave"),
	LEAVE_MODULE_MANAGER_CANCEL_MULTIPLE_DAY_LEAVE("leave-module-manager-cancel-multiple-day-leave"),
	LEAVE_MODULE_EMPLOYEE_APPROVED_SINGLE_DAY_LEAVE("leave-module-employee-approved-single-day-leave"),
	LEAVE_MODULE_EMPLOYEE_APPROVED_MULTI_DAY_LEAVE("leave-module-employee-approved-multi-day-leave"),
	LEAVE_MODULE_EMPLOYEE_REVOKED_SINGLE_DAY_LEAVE("leave-module-employee-revoked-single-day-leave"),
	LEAVE_MODULE_EMPLOYEE_REVOKED_MULTI_DAY_LEAVE("leave-module-employee-revoked-multi-day-leave"),
	LEAVE_MODULE_EMPLOYEE_DECLINED_SINGLE_DAY_LEAVE("leave-module-employee-declined-single-day-leave"),
	LEAVE_MODULE_EMPLOYEE_DECLINED_MULTI_DAY_LEAVE("leave-module-employee-declined-multi-day-leave"),
	LEAVE_MODULE_EMPLOYEE_AUTO_APPROVED_SINGLE_DAY_LEAVE("leave-module-employee-auto-approved-single-day-leave"),
	LEAVE_MODULE_EMPLOYEE_AUTO_APPROVED_MULTI_DAY_LEAVE("leave-module-employee-auto-approved-multi-day-leave"),
	LEAVE_MODULE_EMPLOYEE_LEAVE_CARRY_FORWARD("leave-module-employee-leave-carry-forward"),
	LEAVE_MODULE_EMPLOYEE_CUSTOM_ALLOCATION("leave-module-employee-custom-allocation"),
	LEAVE_MODULE_MANAGER_APPROVED_SINGLE_DAY_LEAVE("leave-module-manager-approved-single-day-leave"),
	LEAVE_MODULE_MANAGER_APPROVED_MULTI_DAY_LEAVE("leave-module-manager-approved-multi-day-leave"),
	LEAVE_MODULE_MANAGER_REVOKED_SINGLE_DAY_LEAVE("leave-module-manager-revoked-single-day-leave"),
	LEAVE_MODULE_MANAGER_REVOKED_MULTI_DAY_LEAVE("leave-module-manager-revoked-multi-day-leave"),
	LEAVE_MODULE_MANAGER_DECLINED_SINGLE_DAY_LEAVE("leave-module-manager-declined-single-day-leave"),
	LEAVE_MODULE_MANAGER_DECLINED_MULTI_DAY_LEAVE("leave-module-manager-declined-multi-day-leave"),
	LEAVE_MODULE_MANAGER_NUDGE_SINGLE_DAY_LEAVE("leave-module-manager-nudge-single-day-leave"),
	LEAVE_MODULE_MANAGER_NUDGE_MULTI_DAY_LEAVE("leave-module-manager-nudge-multi-day-leave"),
	LEAVE_MODULE_MANAGER_AUTO_APPROVED_SINGLE_DAY_LEAVE("leave-module-manager-auto-approved-single-day-leave"),
	LEAVE_MODULE_MANAGER_AUTO_APPROVED_MULTI_DAY_LEAVE("leave-module-manager-auto-approved-multi-day-leave");

	private final String templateId;

}
