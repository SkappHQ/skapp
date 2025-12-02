package com.skapp.enterprise.esignature.payload.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentPdfConvertFilterRequestDto {

	@NotNull
	private Long documentId;

	@Min(0)
	private int page = 0;

}
