package com.skapp.enterprise.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum AllowedOAuthFlows {

	IMPLICIT("implicit"), CODE("code"), CLIENT_CREDENTIALS("client_credentials");

	private final String flowName;

	@Override
	public String toString() {
		return this.flowName;
	}

}
