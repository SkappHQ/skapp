package com.skapp.community.common.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BulkResponseDto {

	private List<ErrorLogDto> bulkRecordErrorLogs;

	private BulkStatusSummaryDto bulkStatusSummary;

}
