package com.skapp.enterprise.esignature.payload.request.eid;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO for operations on an existing eID verification session.
 */
@Getter
@Setter
public class VerificationSessionRequestDto {

	@NotBlank(message = "Session ID is required")
	private String sessionId;

}
