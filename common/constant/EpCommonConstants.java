package com.skapp.enterprise.common.constant;

import lombok.experimental.UtilityClass;

import java.util.Arrays;
import java.util.List;

@UtilityClass
public class EpCommonConstants {

	public static final String RESULTS = "results";

	public static final String MASTER_DATABASE = "master";

	public static final String APPLICATION_NAME = "Skapp";

	public static final String CALENDAR_ID = "primary";

	public static final String GOOGLE_PERMISSION_PEOPLE_ME = "people/me";

	public static final String HTTP_POST_HEADER_CONTENT_TYPE = "Content-Type";

	public static final String GOOGLE_CALENDAR_EVENT_SUMMARY = "Out of Office";

	public static final String GOOGLE_CALENDAR_EVENT_TRANSPARENCY = "opaque";

	public static final String GOOGLE_CALENDAR_EVENT_VISIBILITY = "default";

	public static final String GOOGLE_CALENDAR_EVENT_TYPE = "outOfOffice";

	public static final String GOOGLE_CALENDAR_EVENT_CANCELLED = "cancelled";

	public static final String TOKEN = "token=";

	public static final String EMAIL = "email";

	public static final String NAME = "name";

	public static final String BEARER = "Bearer ";

	public static final String PREFERRED_USERNAME = "preferred_username";

	public static final String HTTP_POST_HEADER_VALUE = "application/x-www-form-urlencoded";

	public static final String GOOGLE_PERMISSION_EMAIL_ADDRESS = "emailAddresses";

	public static final String ENTERPRISE_GOOGLE_ACCESS_TYPE = "offline";

	public static final String ENTERPRISE_GOOGLE_APPROVAL_PROMPT = "force";

	public static final String ENTERPRISE_GOOGLE_TOKEN_REVOKE_URL = "https://accounts.google.com/o/oauth2/revoke";

	public final List<String> ENTERPRISE_GOOGLE_CALENDAR_SCOPES = Arrays.asList(
			"https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar",
			"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile");

	public final List<String> ENTERPRISE_GOOGLE_AUTH_SCOPES = Arrays
		.asList("https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile");

	public final String ENTERPRISE_MICROSOFT_AUTH_SCOPES = "openid profile email offline_access User.Read";

	public static final String ENTERPRISE_MICROSOFT_LOGIN_URL = "https://login.microsoftonline.com/";

	public static final String ENTERPRISE_MICROSOFT_GRAPH_API = "https://graph.microsoft.com/v1.0/me/photo/$value";

	public static final String ENTERPRISE_MICROSOFT_CALENDAR_SCOPES = "https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read offline_access openid";

	public static final String ENTERPRISE_MICROSOFT_GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

	public static final int MAXIMUM_COMPANY_DOMAIN_NAME_LENGTH = 20;

	public static final String JWT_ISSUER = "https://accounts.google.com";

	public static final String JWK_PROVIDER = "https://www.googleapis.com/oauth2/v3/certs";

	public static final int ENTERPRISE_FREE_MAX_EMPLOYEE_COUNT = 10;

	public static final int ENTERPRISE_FREE_MAX_SUPER_ADMIN_COUNT = 3;

	public static final int ENTERPRISE_FREE_MAX_LEAVE_ADMIN_COUNT = 1;

	public static final int ENTERPRISE_FREE_MAX_LEAVE_MANAGER_COUNT = 1;

	public static final int ENTERPRISE_FREE_MAX_ATTENDANCE_ADMIN_COUNT = 1;

	public static final int ENTERPRISE_FREE_MAX_ATTENDANCE_MANAGER_COUNT = 1;

	public static final int ENTERPRISE_FREE_MAX_PEOPLE_ADMIN_COUNT = 1;

	public static final int ENTERPRISE_FREE_MAX_PEOPLE_MANAGER_COUNT = 1;

	public static final int ENTERPRISE_FREE_MAX_ESIGN_ADMIN_COUNT = 1;

	public static final int ENTERPRISE_FREE_MAX_ESIGN_SENDER_COUNT = 1;

	public static final String ENTERPRISE_CALENDER_CONCAT_PATTERN_FOR_STATE = ":::---:::";

	public static final String SUBSCRIPTION = "subscription";

	public static final int SENDGRID_EMAIL_SCHEDULE_MAX_HOURS = 72;

	public static final int HOURS_A_DAY = 24;

	public static final String SENDGRID_CANCEL_SCHEDULED_MAIL = "cancel";

	public static final String TENANT_ID_KEY = "tenantId";

	public static final String EMAIL_KEY = "email";

	public static final String SENDER = "sender";

	public static final String SUPER_ADMIN_NAME = "superAdminName";

	public static final String VIA = " via ";

	public static final String ESIGNATURE = "esignature";

	public static final String DASHBOARD = "dashboard";

	public static final String MODULE = "module";

	public static final int S3_SIGNED_URL_DURATION = 15;

	public static final int CACHED_S3_SIGNED_URL_DURATION = 8640; // 6 days

	public static final String PRD_CONFIG_PATH = "enterprise/validations/email-validation-prd.yml";

	public static final String NON_PRD_CONFIG_PATH = "enterprise/validations/email-validation-non-prd.yml";

	public static final String MOBILE_APP_LEAVE_URL = "com.skapp.app://LeaveRequests";

	public static final String S3_PROFILE_PIC_THUMBNAIL_PATH = "profilePictures/thumbnail/";

	public static final int OTP_GENERATION_DELAY_TIME_SECONDS = 30;

}
