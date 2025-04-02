package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.AuditAction;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuditTrailResponseDto {

	private AuditAction action;

	private String actionDoneByName;

	private String timestamp;

}
