package com.skapp.community.common.payload.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class WorkLocationRequestDto {

	private String name;

	private String address;

	private Boolean isAllEmployees;

	private List<Long> employeeIds;

	private WorkLocationGeofenceRequestDto geofence;

}
