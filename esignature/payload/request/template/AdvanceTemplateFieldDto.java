package com.skapp.enterprise.esignature.payload.request.template;

import com.skapp.enterprise.esignature.payload.request.FieldOptionDto;
import com.skapp.enterprise.esignature.type.FieldType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdvanceTemplateFieldDto {

	@NotNull(message = "{validation.template.field.templateDocumentId.notnull}")
	private Long templateDocumentId;

	@NotNull(message = "{validation.template.field.type.notnull}")
	private FieldType type;

	@NotNull(message = "{validation.template.field.pageNumber.notnull}")
	@Min(value = 1, message = "{validation.template.field.pageNumber.min}")
	private Integer pageNumber;

	@NotNull(message = "{validation.template.field.xPosition.notnull}")
	@DecimalMin(value = "0.0", message = "{validation.template.field.xPosition.min}")
	private Float xPosition;

	@NotNull(message = "{validation.template.field.yPosition.notnull}")
	@DecimalMin(value = "0.0", message = "{validation.template.field.xPosition.min}")
	private Float yPosition;

	@NotNull(message = "{validation.template.field.width.notnull}")
	@DecimalMin(value = "0.0", message = "{validation.template.field.width.min}")
	private Float width;

	@NotNull(message = "{validation.template.field.height.notnull}")
	@DecimalMin(value = "0.0", message = "{validation.template.field.height.min}")
	private Float height;

	@NotNull(message = "{validation.template.field.width-percentage.notnull}")
	private Float widthPercentage;

	@NotNull(message = "{validation.template.field.height-percentage.notnull}")
	private Float heightPercentage;

	private FieldOptionDto fieldOption;

}
