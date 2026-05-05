package com.skapp.enterprise.people.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EpPeopleMessageConstant implements MessageConstant {

	EP_PEOPLE_SUCCESS_MANAGERS_AND_SUPERVISORS_TRANSFER("ep.people.success.managers-and-supervisor-transfer"),
	EP_PEOPLE_SUCCESS_GUEST_USER_DELETED("ep.people.success.guest-user-deleted"),
	EP_PEOPLE_SUCCESS_GUEST_USER_DEACTIVATED("ep.people.success.guest-user-deactivated"),
	EP_PEOPLE_SUCCESS_GUEST_USER_ACTIVATED("ep.people.success.guest-user-activated"),
	EP_PEOPLE_SUCCESS_GUEST_USER_APPROVED("ep.people.success.guest-user-approved"),
	EP_PEOPLE_SUCCESS_GUEST_USER_DECLINED("ep.people.success.guest-user-declined"),
	EP_PEOPLE_SUCCESS_GUEST_USER_REQUEST_REVOKED("ep.people.success.guest-user-request-revoked"),

	EP_PEOPLE_ERROR_INVALID_GUEST_USER_REQUEST_ID("ep.people.error.invalid-guest-user-request-id"),
	EP_PEOPLE_ERROR_ALLOWED_USER_LIMIT_EXCEEDED("ep.people.error.allowed-user-limit-exceeded"),
	EP_PEOPLE_ERROR_SUPERVISOR_NOT_FOUND("ep.people.error.supervisor-not-found"),
	EP_PEOPLE_ERROR_MANAGER_NOT_FOUND("ep.people.error.manager-not-found"),
	EP_PEOPLE_ERROR_NO_EMPLOYEES_TO_DEACTIVATE("ep.people.error.no-employees-to-deactivate"),
	EP_PEOPLE_ERROR_EMPLOYEES_NOT_FOUND("ep.people.error.employees-not-found"),
	EP_PEOPLE_SUCCESS_EMPLOYEES_DEACTIVATED("ep.people.success.employees-deactivated"),
	PEOPLE_ERROR_INVALID_ESIGN_ROLE("ep.people.error.invalid-esign-role"),
	PEOPLE_ERROR_ESIGN_RESTRICTED_ROLE_ACCESS("ep.people.error.restricted-esign-role-access"),
	PEOPLE_ERROR_ESIGN_ROLE_REQUIRED("ep.people.error.esign-role-required"),;

	private final String messageKey;

}
