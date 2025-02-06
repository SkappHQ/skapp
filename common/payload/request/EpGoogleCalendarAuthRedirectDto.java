package com.skapp.enterprise.common.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpGoogleCalendarAuthRedirectDto {

	private String code;

	private String state;

	private String scope;

	private String error;

}
