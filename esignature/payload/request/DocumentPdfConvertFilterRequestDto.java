package com.skapp.enterprise.esignature.payload.request;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentPdfConvertFilterRequestDto {

	private Long documentId;

	@Min(0)
	private int page = 0;

}
