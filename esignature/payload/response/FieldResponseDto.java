package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.FieldStatus;
import com.skapp.enterprise.esignature.type.FieldType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FieldResponseDto {

	private Long id;

	private FieldType type;

	private FieldStatus status;

	private int pageNumber;

	private float xPosition;

	private float yPosition;

	private Long documentId;

	private String recipientMail;

	private String fontFamily;

	private String fontColor;

	private String width;

	private String height;

	private FieldValueResponseDto fieldValueResponseDto;

	private Long fieldContainerId;

	private FieldOptionResponseDto fieldOptionResponseDto;

}
