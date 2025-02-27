package com.skapp.enterprise.people.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EpPeopleMessageConstant implements MessageConstant {

	EP_PEOPLE_ERROR_ALLOWED_USER_LIMIT_EXCEEDED("ep.people.error.allowed-user-limit-exceeded"),
	EP_PEOPLE_SUCCESS_MANAGERS_AND_SUPERVISORS_TRANSFER("ep.people.success.managers-and-supervisor-transfer"),
	EP_PEOPLE_ERROR_SUPERVISOR_NOT_FOUND("ep.people.error.supervisor-not-found"),
	EP_PEOPLE_ERROR_MANAGER_NOT_FOUND("ep.people.error.manager-not-found"),;

	private final String messageKey;

}
