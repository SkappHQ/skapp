package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentCompleteResponseDto {

	private EnvelopeStatus status;

	private String accessLink;

}
