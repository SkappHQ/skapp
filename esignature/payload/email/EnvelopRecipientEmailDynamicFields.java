package com.skapp.enterprise.esignature.payload.email;

import com.skapp.community.common.payload.email.CommonEmailDynamicFields;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EnvelopRecipientEmailDynamicFields extends CommonEmailDynamicFields {

	private String envelopeSubject;

	private String envelopeMessage;

	private String sender;

	private String senderEmail;

	private Long envelopId;

	private String envelopName;

	private String envelopeUrl;

	private String documentNames;

}
