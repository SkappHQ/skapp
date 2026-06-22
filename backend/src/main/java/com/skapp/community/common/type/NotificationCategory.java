package com.skapp.community.common.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationCategory {

	PEOPLE("people"), LEAVE("leave"), ATTENDANCE("attendance"), OKR("okr"), ESIGN("esign"),PEOPLE_SYNC("people_sync");

	private final String label;

}
