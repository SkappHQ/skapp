package com.skapp.enterprise.esignature.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentPdfConvertMetaResponseDto {

	private Long documentId;

	private int numberOfPages;

}
