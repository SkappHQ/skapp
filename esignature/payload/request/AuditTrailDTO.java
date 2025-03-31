package com.skapp.enterprise.esignature.payload.request;

import com.skapp.enterprise.esignature.type.AuditAction;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class AuditTrailDTO {

	private Long envelopeId;

	private Long recipientId;

	private String ipAddress;

	private AuditAction action;

	private String metadata;

}
