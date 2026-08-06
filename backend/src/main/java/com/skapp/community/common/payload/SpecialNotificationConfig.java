package com.skapp.community.common.payload;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpecialNotificationConfig {

	private Boolean isTurnedOn = false;

	private Boolean isOrganizationWide = false;

	private Boolean isTeamWide = false;

}
