package com.skapp.community.common.payload.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkLocationGeofenceRequestDto {

	private Double latitude;

	private Double longitude;

	private Integer radiusMeters;

}
