package com.skapp.community.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SpecialNotificationType {

	BIRTHDAY(OrganizationConfigType.BIRTHDAY_NOTIFICATIONS);

	private final OrganizationConfigType organizationConfigType;

}
