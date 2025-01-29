package com.skapp.enterprise.esignature.payload.request;

import com.skapp.enterprise.esignature.type.FieldStatus;
import com.skapp.enterprise.esignature.type.FieldType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FieldDto {

	@NotNull(message = "{notnull.field.type}")
	private FieldType type;

	private FieldStatus status;

	@NotNull(message = "{notnull.field.pageNumber}")
	@Min(value = 1, message = "{min.pageNumber}")
	private Integer pageNumber;

	@NotNull(message = "{notnull.field.xPosition}")
	@Min(value = 0, message = "{min.xPosition}")
	private Float xPosition;

	@NotNull(message = "{notnull.field.yPosition}")
	@Min(value = 0, message = "{min.yPosition}")
	private Float yPosition;

	@NotNull(message = "{notnull.field.documentId}")
	private Long documentId;

}
