package com.skapp.community.common.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class WorkLocationDetailResponseDto {

	private Long workLocationId;

	private String name;

	private String address;

	private Long employeeCount;

	private Boolean isAllEmployees;

	private List<WorkLocationEmployeeResponseDto> employees;

	private WorkLocationGeofenceResponseDto geofence;

}
