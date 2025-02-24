package com.skapp.enterprise.esignature.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentDto {

	@NotBlank(message = "{validation.document.name.not_blank}")
	private String name;

	@NotBlank(message = "{validation.document.file.path.not_blank}")
	private String filePath;

}
