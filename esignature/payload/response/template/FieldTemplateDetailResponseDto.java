package com.skapp.enterprise.esignature.payload.response.template;

import com.skapp.enterprise.esignature.type.FieldStatus;
import com.skapp.enterprise.esignature.type.FieldType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FieldTemplateDetailResponseDto {

	private Long id;

	private FieldType type;

	private int pageNumber;

	private float xPosition;

	private float yPosition;

	private Long documentId;

	private String width;

	private String height;

}
