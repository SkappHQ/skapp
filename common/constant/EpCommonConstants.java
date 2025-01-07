package com.skapp.enterprise.common.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class EpCommonConstants {

	public static final String MASTER_DATABASE = "master";

	public static final int MAXIMUM_COMPANY_DOMAIN_NAME_LENGTH = 20;

	public static final String JWT_ISSUER = "https://accounts.google.com";

	public static final String JWK_PROVIDER = "https://www.googleapis.com/oauth2/v3/certs";

	public static final int ENTERPRISE_FREE_MAX_EMPLOYEE_COUNT = 50;

	public static final int ENTERPRISE_FREE_MAX_SUPER_ADMIN_COUNT = 3;

	public static final int ENTERPRISE_FREE_MAX_LEAVE_ADMIN_COUNT = 1;

	public static final int ENTERPRISE_FREE_MAX_LEAVE_MANAGER_COUNT = 1;

	public static final int ENTERPRISE_FREE_MAX_ATTENDANCE_ADMIN_COUNT = 1;

	public static final int ENTERPRISE_FREE_MAX_ATTENDANCE_MANAGER_COUNT = 1;

	public static final int ENTERPRISE_FREE_MAX_PEOPLE_ADMIN_COUNT = 1;

	public static final int ENTERPRISE_FREE_MAX_PEOPLE_MANAGER_COUNT = 1;

}
