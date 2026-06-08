package com.skapp.community.timeplanner.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum TimeMessageConstant implements MessageConstant {

	// Success messages
	TIME_SUCCESS_ATTENDANCE_CONFIG_UPDATED("api.success.time.attendance.config.updated"),
	TIME_SUCCESS_TIME_RECORD_ADDED("api.success.time.time-record-added"),

	// Error messages
	TIME_ERROR_ATTENDANCE_CONFIG_NOT_FOUND("api.error.time.attendance.config.not.found"),
	TIME_ERROR_CLOCK_IN_NOT_EXISTS_FOR_CURRENT_DATE("api.error.time.clockin-not-exist-for-current.date"),
	TIME_ERROR_TIME_CLOCK_IN_EXISTS_FOR_CURRENT_DATE("api.error.time.clockin-exist-for-current.date"),
	TIME_ERROR_END_TIME_BEFORE_START_TIME("api.error.time.end-time-before-start-time"),
	TIME_ERROR_ZONE_ID_IS_INVALID("api.error.time.invalid.zone-id"),
	TIME_ERROR_START_END_TIME_DIFFERENT_DATES("api.error.time.start-end-time-different-dates"),
	TIME_ERROR_NO_TIME_RECORD_FOUND("api.error.time.no-time-record-found"),
	TIME_ERROR_CANNOT_ADD_REQUEST_FOR_FUTURE("api.error.time.cannot-add-request-for-future"),
	TIME_ERROR_NO_TIME_RECORD_TO_EDIT("api.error.time.no-time-record-to-edit"),
	TIME_ERROR_TIME_RECORD_EMPLOYEE_ID_MISMATCH("api.error.time.time-record-employee-id-mismatch"),
	TIME_ERROR_TIME_RECORD_DATE_AND_REQUEST_START_DATETIME_MISMATCH("api.error.time.record-date.mismatch"),
	TIME_ERROR_CLOCK_IN_NOT_FOUND("api.error.time.clock.in.not-found"),
	TIME_ERROR_CLOCK_OUT_NOT_FOUND("api.error.time.clock.out.not-found"),
	TIME_ERROR_FOUND_OVERLAPPING_REQUESTS("api.error.time.found-overlapping-requests"),
	TIME_ERROR_TIME_REQUEST_CANNOT_EDIT("api.error.time.time-request-cannot-edit"),
	TIME_ERROR_TIME_REQUEST_NOT_FOUND("api.error.time.time-request-not-found"),
	TIME_ERROR_TIME_RECORD_COMPLETED("api.error.time.time-record-completed"),
	TIME_ERROR_START_DATE_END_DATE_NOT_VALID("api.error.time.trend.start.end.date.not.valid"),
	TIME_ERROR_NO_TIME_REQUEST_FOUND("api.error.time.request-not-found"),
	TIME_ERROR_TIME_REQUEST_MANAGER_MISMATCH("api.error.time.time-request-manager-mismatch"),
	TIME_ERROR_CANNOT_ADD_RECORD_FOR_FUTURE("api.error.time.cannot-add-record-for-future"),
	TIME_ERROR_DATE_REQUIRED("api.error.time.date-required"),
	TIME_ERROR_RECORD_TYPE_REQUIRED("api.error.time.record-type-required"),
	TIME_ERROR_TIME_OFFSET_REQUIRED("api.error.time.time-offset-required"),
	TIME_ERROR_INVALID_TIME_BLOCKS("api.error.time.invalid-time-blocks"),
	TIME_ERROR_MONTH_REQUIRED("api.error.time.month-required"),
	TIME_ERROR_MANAGER_OR_ABOVE_PERMISSIONS_REQUIRED("api.error.time.time-request-permission.not.found");

	private final String messageKey;

}
