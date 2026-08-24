package com.skapp.community.leaveplanner.util;

import java.time.LocalDate;

@FunctionalInterface
public interface PolicyLeaveUsageLookup {

	float usedBetween(LocalDate from, LocalDate to);

}
