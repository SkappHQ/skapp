package com.skapp.enterprise.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum AllowedOAuthScopes {

	PHONE("phone"), EMAIL("email"), OPENID("openid"), PROFILE("profile");

	private final String scopeName;

	@Override
	public String toString() {
		return this.scopeName;
	}

}
