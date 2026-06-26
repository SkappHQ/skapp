package com.skapp.community.common.payload.response;

import com.skapp.community.common.type.HealthStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class HealthResponse {

	private HealthStatus status;

	private String timestamp;

	private String version;

}
