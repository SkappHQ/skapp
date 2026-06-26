package com.skapp.community.common.payload.response;

import java.util.concurrent.atomic.AtomicInteger;

public class BulkStatusSummaryDto {

	private final AtomicInteger successCount = new AtomicInteger(0);

	private final AtomicInteger failedCount = new AtomicInteger(0);

	public void incrementSuccessCount() {
		this.successCount.incrementAndGet();
	}

	public void incrementFailedCount() {
		this.failedCount.incrementAndGet();
	}

	public int getSuccessCount() {
		return successCount.get();
	}

	public int getFailedCount() {
		return failedCount.get();
	}

}
