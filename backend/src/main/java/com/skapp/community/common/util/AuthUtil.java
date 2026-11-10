package com.skapp.community.common.util;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.model.User;
import com.skapp.community.common.type.Role;
import lombok.experimental.UtilityClass;

import java.time.Instant;

@UtilityClass
public class AuthUtil {

	public static String withRolePrefix(Role role) {
		return AuthConstants.AUTH_ROLE + role.name();
	}

	public static Instant tempPasswordExpiryFromNow() {
		return Instant.now().plus(AuthConstants.TEMP_PASSWORD_VALIDITY);
	}

	public static void issueTempPassword(User user, String encodedTempPassword) {
		if (user == null) {
			return;
		}
		user.setTempPassword(encodedTempPassword);
		user.setPassword(encodedTempPassword);
		user.setIsPasswordChangedForTheFirstTime(false);
		user.setTempPasswordExpiresAt(tempPasswordExpiryFromNow());
	}

}
