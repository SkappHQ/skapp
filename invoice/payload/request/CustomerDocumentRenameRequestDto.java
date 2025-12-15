package com.skapp.enterprise.invoice.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerDocumentRenameRequestDto {

	private Long documentId;

	private String newName;

}
