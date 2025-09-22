package com.skapp.enterprise.invoice.payload.request;

import com.skapp.enterprise.invoice.type.DocumentStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerDocumentCreateRequestDto {

	private String name;

	private String documentUrl;

	private DocumentStatus documentStatus = DocumentStatus.UPLOADED;

	private Long customerId;

}
