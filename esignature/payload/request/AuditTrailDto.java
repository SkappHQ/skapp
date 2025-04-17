package com.skapp.enterprise.esignature.payload.request;

import com.skapp.enterprise.esignature.type.AuditAction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AuditTrailDto {

	@NotNull(message = "validation.audit_trail.envelope_id.not_blank")
	private Long envelopeId;

	private Long recipientId;

	@NotBlank(message = "validation.audit_trail.ip_address.not_blank")
	private String ipAddress;

	@NotNull(message = "validation.audit_trail.action.not_blank")
	private AuditAction action;

	private List<MetadataRequestDto> metadata;

}
