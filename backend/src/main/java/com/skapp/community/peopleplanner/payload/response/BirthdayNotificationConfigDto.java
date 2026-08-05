package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.common.payload.SpecialNotificationConfig;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BirthdayNotificationConfigDto implements SpecialNotificationConfig {

	private Boolean isTurnedOn = false;

	private Boolean isOrganizationWide = false;

	private Boolean isTeamWide = false;

}
