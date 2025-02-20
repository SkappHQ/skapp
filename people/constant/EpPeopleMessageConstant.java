package com.skapp.enterprise.people.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EpPeopleMessageConstant implements MessageConstant {

	EP_PEOPLE_ERROR_ALLOWED_USER_LIMIT_EXCEEDED("ep.people.error.allowed.user.limit.exceeded");

	private final String messageKey;

}