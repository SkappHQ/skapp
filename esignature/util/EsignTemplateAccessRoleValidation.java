package com.skapp.enterprise.esignature.util;

import com.skapp.community.common.model.User;
import com.skapp.community.common.type.Role;
import lombok.experimental.UtilityClass;

@UtilityClass
public class EsignTemplateAccessRoleValidation {

	public static boolean validateAccessFromUserRole(User currentUser) {

		return currentUser.getEmployee().getEmployeeRole().getEsignRole().equals(Role.ESIGN_ADMIN)
				|| currentUser.getEmployee().getEmployeeRole().getEsignRole().equals(Role.SUPER_ADMIN);

	}

}
