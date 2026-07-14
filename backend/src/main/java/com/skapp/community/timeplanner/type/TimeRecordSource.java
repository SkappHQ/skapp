package com.skapp.community.timeplanner.type;

/**
 * Where a clock-in / clock-out originated. MANUAL is reserved for records produced by the
 * manual-entry approval flow (which also sets {@code isManual}).
 */
public enum TimeRecordSource {

	WEB, MOBILE, DEVICE, MANUAL

}
