package com.skapp.enterprise.esignature.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EditDocumentDto {

	@NotBlank(message = "file.path.is.required")
	private String filePath;

	@NotBlank(message = "name.is.required")
	private String name;

}
