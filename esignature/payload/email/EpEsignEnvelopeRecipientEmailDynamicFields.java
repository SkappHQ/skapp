package com.skapp.enterprise.esignature.payload.email;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpEsignEnvelopeRecipientEmailDynamicFields {

	private String envelopeSubject;

	private String envelopeMessage;

	private String recipientName;

	private String sender;

	private String senderEmail;

	private Long envelopId;

	private String envelopName;

	private String envelopeUrl;

	private String documentNames;

	private String appUrl;

}
