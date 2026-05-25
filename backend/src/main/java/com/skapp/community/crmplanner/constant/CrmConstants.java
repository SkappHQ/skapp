package com.skapp.community.crmplanner.constant;

import com.skapp.community.common.type.Role;
import lombok.experimental.UtilityClass;

import java.util.Set;

@UtilityClass
public class CrmConstants {

	public static final Set<Role> ASSIGNABLE_CRM_ROLES = Set.of(Role.CRM_ADMIN, Role.CRM_SALES_MANAGER,
			Role.CRM_SALES_REPRESENTATIVE);

	public static final String CONTACT_NAME_REGEX = "^[\\p{L} \\-.,]+$";

	public static final int COMPANY_NAME_MAX_LENGTH = 30;

	public static final int CONTACT_NAME_MAX_LENGTH = 255;

	public static final int ADDRESS_MAX_LENGTH = 100;

	public static final int CHARACTER_MAX_LENGTH = 50;

	public static final int PHONE_MAX_LENGTH = 15;

}
