package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.common.payload.response.BulkStatusSummaryDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BulkAssignResponseDto {

	private List<BulkAssignErrorLogDto> bulkRecordErrorLogs;

	private BulkStatusSummaryDto bulkStatusSummary;

}
