package com.skapp.community.common.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BirthdayNotificationConfigRequestDto {

	private Boolean isTurnedOn;

	private Boolean isOrganizationWide;

	private Boolean isTeamWide;

}
