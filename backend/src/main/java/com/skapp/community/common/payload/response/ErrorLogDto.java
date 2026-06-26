package com.skapp.community.common.payload.response;

import com.skapp.community.common.type.BulkItemStatus;
import com.skapp.community.leaveplanner.payload.CustomEntitlementDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorLogDto {

	private String email;

	private Long employeeId;

	private String employeeName;

	private List<CustomEntitlementDto> entitlementsDto;

	private BulkItemStatus status;

	private String message;

}
