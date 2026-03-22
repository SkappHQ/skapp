package com.skapp.enterprise.esignature.payload.request;

import com.skapp.enterprise.esignature.type.FieldStatus;
import com.skapp.enterprise.esignature.type.FieldType;
import com.skapp.enterprise.esignature.util.deserializer.DocumentFieldStatusDeserializer;
import com.skapp.enterprise.esignature.util.deserializer.DocumentFieldTypeDeserializer;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import tools.jackson.databind.annotation.JsonDeserialize;

@Getter
@Setter
public class FieldDto {

	@NotNull(message = "{validation.field.type.notnull}")
	@JsonDeserialize(using = DocumentFieldTypeDeserializer.class)
	private FieldType type;

	@NotNull(message = "{validation.field.status.notnull}")
	@JsonDeserialize(using = DocumentFieldStatusDeserializer.class)
	private FieldStatus status;

	@NotNull(message = "{validation.field.pageNumber.notnull}")
	@Min(value = 1, message = "{validation.field.pageNumber.min}")
	private Integer pageNumber;

	@NotNull(message = "{validation.field.xPosition.notnull}")
	@Min(value = 0, message = "{validation.field.xPosition.min}")
	private Float xposition;

	@NotNull(message = "{validation.field.yPosition.notnull}")
	@Min(value = 0, message = "{validation.field.yPosition.min}")
	private Float yposition;

	@NotNull(message = "{validation.field.width.notnull}")
	private Float width;

	@NotNull(message = "{validation.field.height.notnull}")
	private Float height;

	@NotNull(message = "{validation.field.documentId.notnull}")
	private Long documentId;

	@NotNull(message = "{validation.field.width-percentage.notnull}")
	private Float widthPercentage;

	@NotNull(message = "{validation.field.height-percentage.notnull}")
	private Float heightPercentage;

}
