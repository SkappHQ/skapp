package com.skapp.community.common.util;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.type.Role;
import lombok.experimental.UtilityClass;

@UtilityClass
public class AuthUtil {

	public static String withRolePrefix(Role role) {
		return AuthConstants.AUTH_ROLE + role.name();
	}

}
