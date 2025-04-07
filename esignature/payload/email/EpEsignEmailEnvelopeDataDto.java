package com.skapp.enterprise.esignature.payload.email;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpEsignEmailEnvelopeDataDto {

	private Long envelopeId;

	private String envelopeName;

	private String envelopeMessage;

	private String envelopeSubject;

	private String documentNames;

	private Integer reminderDays;

}
