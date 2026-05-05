package com.skapp.community.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkLocationGeofenceResponseDto {

	private Long id;

	private Double latitude;

	private Double longitude;

	private Integer radiusMeters;

}
