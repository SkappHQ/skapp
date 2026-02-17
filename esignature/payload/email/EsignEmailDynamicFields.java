package com.skapp.enterprise.esignature.payload.email;

import com.skapp.community.common.payload.email.CommonEmailDynamicFields;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsignEmailDynamicFields extends CommonEmailDynamicFields {

	private String documentName;

	private String senderName;

	private String recipientName;

}