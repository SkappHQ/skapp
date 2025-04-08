package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.AuditAction;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class AuditTrailResponseDto {

	private Long envelopId;

	private AuditAction action;

	private String actionDoneByName;

	private Instant timestamp;

	private List<MetadataResponseDto> metadata;

	private Boolean isAuthorized;

	private String hash;

}
