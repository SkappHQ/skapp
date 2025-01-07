package com.skapp.enterprise.common.payload.request;

import lombok.Data;

@Data
public class EpPasswordResetDto {

	private String tenantId;

	private String email;

}
