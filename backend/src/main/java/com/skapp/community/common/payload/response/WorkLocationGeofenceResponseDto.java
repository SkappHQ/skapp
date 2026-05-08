package com.skapp.community.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkLocationGeofenceResponseDto {

	private Long id;

	private String latitude;

	private String longitude;

	private Integer radiusMeters;

}
