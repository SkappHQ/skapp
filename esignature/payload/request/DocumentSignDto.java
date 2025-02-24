package com.skapp.enterprise.esignature.payload.request;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class DocumentSignDto {

	private Long envelopeId;

	private Long documentId;

	private Integer currentDocumentVersionId;

	private List<FieldSignDto> fieldSignDtoList;

	private Long recipientId;

	private Long addressBookId;

}
