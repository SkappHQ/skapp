package com.skapp.community.peopleplanner.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class PeopleConstants {

	public static final int HOLIDAY_NAME_MAX_LENGTH = 50;

	public static final String HOLIDAY_NAME_REGEX_PATTERN = "^[a-zA-Z ]*$";

	public static final Long HOLIDAY_ALL_WORK_LOCATIONS_ID = -1L;

	public static final String HOLIDAY_ALL_WORK_LOCATIONS = "All locations";

	public static final String DELETED_PREFIX = "DELETED_";

	public static final int MAXIMUM_HOLIDAYS_PER_DAY = 3;

	public static final int MAX_NAME_LENGTH = 50;

	public static final int MAX_EMAIL_LENGTH = 100;

	public static final int MAX_PHONE_LENGTH = 15;

	public static final int MAX_ADDRESS_LENGTH = 255;

	public static final int MAX_EDUCATIONAL_DETAILS_LENGTH = 255;

	public static final int MAX_ID_LENGTH = 10;

	public static final int MAX_NIN_LENGTH = 15;

	public static final int MAX_SSN_LENGTH = 11;

	public static final int MAX_EMPLOYEE_NUMBER_LENGTH = 10;

}
