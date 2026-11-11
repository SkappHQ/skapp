package com.skapp.community.common.constant;

import lombok.experimental.UtilityClass;

import java.time.Duration;

@UtilityClass
public class AuthConstants {

	public static final String AUTH_ROLE = "ROLE_";

	public static final String TOKEN_TYPE = "token_type";

	public static final String ROLES = "roles";

	public static final String AUTHORIZATION = "Authorization";

	public static final String BEARER = "Bearer ";

	public static final String TOKEN = "token";

	public static final String USER_ID = "userId";

	public static final String SYSTEM_VERSION = "system_version";

	public static final String USER_VERSION = "user_version";

	public static final String DEFAULT_SYSTEM_VERSION = "1.0.0";

	public static final String DEFAULT_USER_VERSION = "1.0.0";

	public static final Duration TEMP_PASSWORD_VALIDITY = Duration.ofHours(24);

}
