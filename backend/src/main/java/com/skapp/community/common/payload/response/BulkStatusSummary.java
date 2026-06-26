package com.skapp.community.common.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class BulkStatusSummary {

	private int successCount;

	private int failedCount;

}
