package com.skapp.enterprise.esignature.payload.request.template;

import com.skapp.enterprise.esignature.type.FieldType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FieldTemplateDto {

	private Long templateDocumentId;

	private FieldType type;

	private Integer pageNumber;

	private Float xPosition;

	private Float yPosition;

	private Float width;

	private Float height;

}
