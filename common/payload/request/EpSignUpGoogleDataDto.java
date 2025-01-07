package com.skapp.enterprise.common.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpSignUpGoogleDataDto {

	private String name;

	private String email;

	private String authPic;

	private String token;

	public String getFirstName() {
		if (name == null)
			return null;
		String[] nameParts = name.trim().split("\\s+", 2);
		return nameParts[0];
	}

	public String getLastName() {
		if (name == null)
			return null;
		String[] nameParts = name.trim().split("\\s+", 2);
		return nameParts.length > 1 ? nameParts[1] : "";
	}

}
