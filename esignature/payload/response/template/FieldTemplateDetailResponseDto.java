package com.skapp.enterprise.esignature.payload.response.template;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.skapp.enterprise.esignature.type.FieldType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FieldTemplateDetailResponseDto {

	private Long id;

	private FieldType type;

	private Integer pageNumber;

	private Float xPosition;

	private Float yPosition;

	private Long documentId;

	private Float width;

	private Float height;

	@JsonInclude(JsonInclude.Include.NON_NULL)
	private Long templateFieldContainerId;

	@JsonInclude(JsonInclude.Include.NON_NULL)
	private TemplateFieldOptionResponseDto templateFieldOption;

}
