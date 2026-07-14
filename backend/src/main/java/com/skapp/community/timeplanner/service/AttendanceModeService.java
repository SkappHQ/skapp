package com.skapp.community.timeplanner.service;

public interface AttendanceModeService {

	/**
	 * Whether attendance in the current context is restricted to clock-in/clock-out only
	 * (pause/resume unavailable).
	 */
	boolean isClockInClockOutOnly();

}
