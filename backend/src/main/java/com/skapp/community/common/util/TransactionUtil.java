package com.skapp.community.common.util;

import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Slf4j
@UtilityClass
public class TransactionUtil {

	/**
	 * Runs the action once the current transaction commits, or right away when no
	 * transaction is active. A failure in the action is logged and not rethrown, because
	 * Spring rethrows exceptions from {@code afterCommit} to the caller after the data is
	 * already committed.
	 * @param action the action to run after commit
	 */
	public static void runAfterCommit(Runnable action) {
		if (!TransactionSynchronizationManager.isSynchronizationActive()) {
			runSafely(action);
			return;
		}

		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCommit() {
				runSafely(action);
			}
		});
	}

	private static void runSafely(Runnable action) {
		try {
			action.run();
		}
		catch (Exception e) {
			log.error("runAfterCommit: post-commit action failed", e);
		}
	}

}
