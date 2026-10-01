package com.skapp.community.peopleplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BulkReassignSupervisorsAndTerminateOrDeleteEmployeesResponseDto {

	private Integer requested;

	private Integer succeeded;

	private List<Long> failedUserIds;

}
