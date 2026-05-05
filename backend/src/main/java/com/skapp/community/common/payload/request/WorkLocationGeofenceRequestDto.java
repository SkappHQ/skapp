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

	@NotNull
	@DecimalMin("-90.0")
	@DecimalMax("90.0")
	private Double latitude;

	@NotNull
	@DecimalMin("-180.0")
	@DecimalMax("180.0")
	private Double longitude;

	@NotNull
	@Min(1)
	private Integer radiusMeters;

}
