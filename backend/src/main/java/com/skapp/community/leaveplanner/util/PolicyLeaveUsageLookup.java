package com.skapp.community.leaveplanner.util;

import java.time.LocalDate;

/**
 * Supplies the balance-holding leave days an employee has taken against a policy inside a
 * date window. Keeps the derived carryover math free of repository access so it can be
 * reasoned about - and tested - on its own.
 */
@FunctionalInterface
public interface PolicyLeaveUsageLookup {

	/**
	 * @param from The first date of the window, inclusive.
	 * @param to The last date of the window, inclusive.
	 * @return The days used inside the window.
	 */
	float usedBetween(LocalDate from, LocalDate to);

}
