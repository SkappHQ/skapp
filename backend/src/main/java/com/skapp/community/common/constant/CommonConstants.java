package com.skapp.community.common.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class CommonConstants {

	public static final long MAX_RETRIES_COUNT = 3;

	public static final String DEFAULT_TIME_CONFIG_KEY_HOUR = "hours";

	public static final String DEFAULT_TIME_CONFIG_KEY_TIME_BLOCK = "timeBlock";

	public static final String DEFAULT_TIME_CONFIG_VALUE_HOUR = "4.0";

	public static final String DEFAULT_TIME_CONFIG_VALUE_MORNING = "MORNING_HOURS";

	public static final String DEFAULT_TIME_CONFIG_VALUE_EVENING = "EVENING_HOURS";

	public static final Float DEFAULT_TIME_CONFIG_VALUE_TOTAL_HOUR = 8F;

	public static final Integer DEFAULT_TIME_CONFIG_VALUE_START_HOUR = 8;

	public static final Integer DEFAULT_TIME_CONFIG_VALUE_START_MINUTE = 30;

	public static final String NOTIFICATION_TITLE = "title";

	public static final String NOTIFICATION_MESSAGE = "message";

	public static final long WORK_LOCATION_NAME_MAX_LENGTH = 50;

}
