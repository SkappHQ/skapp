package com.skapp.enterprise.common.payload.request;

import lombok.Data;

@Data
public class EpPasswordResetNewPasswordDto {

	private String tenantId;

	private String email;

	private String newPassword;

}
