package com.skapp.enterprise.common.payload.v2;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthUserDetailsDto {

	private String name;

	private String email;

	private String authPicUrl;

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
