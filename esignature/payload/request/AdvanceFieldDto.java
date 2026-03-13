package com.skapp.enterprise.esignature.payload.request;

import com.skapp.enterprise.esignature.type.FieldStatus;
import com.skapp.enterprise.esignature.type.FieldType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdvanceFieldDto {

	@NotNull(message = "{validation.field.type.notnull}")
	private FieldType type;

	@NotNull(message = "{validation.field.status.notnull}")
	private FieldStatus status;

	@NotNull(message = "{validation.field.pageNumber.notnull}")
	@Min(value = 1, message = "{validation.field.pageNumber.min}")
	private Integer pageNumber;

	@NotNull(message = "{validation.field.xPosition.notnull}")
	@Min(value = 0, message = "{validation.field.xPosition.min}")
	private Float xPosition;

	@NotNull(message = "{validation.field.yPosition.notnull}")
	@Min(value = 0, message = "{validation.field.yPosition.min}")
	private Float yPosition;

	@NotNull(message = "{validation.field.width.notnull}")
	private Float width;

	@NotNull(message = "{validation.field.height.notnull}")
	private Float height;

	@NotNull(message = "{validation.field.width-percentage.notnull}")
	private Float widthPercentage;

	@NotNull(message = "{validation.field.height-percentage.notnull}")
	private Float heightPercentage;

	@NotNull(message = "{validation.field.documentId.notnull}")
	private Long documentId;

	private FieldOptionDto fieldOption;

	private Float horizontalPadding;

	private Float verticalPadding;

	private Float textLineHeight;

}
