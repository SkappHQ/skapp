package com.skapp.enterprise.esignature.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentDetailResponseDto {

	private Long id;

	private String name;

	private String filePath;

	private int numOfPages;

}
