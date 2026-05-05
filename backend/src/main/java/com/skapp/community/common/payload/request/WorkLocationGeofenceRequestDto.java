package com.skapp.community.common.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkLocationGeofenceRequestDto {

	private String latitude;

	private String longitude;

	private Integer radiusMeters;

}
