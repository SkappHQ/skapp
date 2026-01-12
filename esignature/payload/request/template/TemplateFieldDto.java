package com.skapp.enterprise.esignature.payload.request.template;

import com.skapp.enterprise.esignature.type.FieldType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TemplateFieldDto {

	@NotNull(message = "{validation.template.field.templateDocumentId.notnull}")
	private Long templateDocumentId;

	@NotNull(message = "{validation.template.field.type.notnull}")
	private FieldType type;

	@NotNull(message = "{validation.template.field.pageNumber.notnull}")
	@Min(value = 1, message = "{validation.template.field.pageNumber.min}")
	private Integer pageNumber;

	@NotNull(message = "{validation.template.field.xPosition.notnull}")
	@Min(value = 0, message = "{validation.template.field.xPosition.min}")
	private Float xPosition;

	@NotNull(message = "{validation.template.field.yPosition.notnull}")
	@Min(value = 0, message = "{validation.template.field.xPosition.min}")
	private Float yPosition;

	@NotNull(message = "{validation.template.field.width.notnull}")
	private Float width;

	@NotNull(message = "{validation.template.field.height.notnull}")
	private Float height;

}
