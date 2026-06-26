package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.common.payload.response.BulkStatusSummary;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EmployeeBulkErrorResponseDto {

	List<EmployeeBulkResponseDto> bulkRecordErrorLogs;

	BulkStatusSummary bulkStatusSummary;

}
