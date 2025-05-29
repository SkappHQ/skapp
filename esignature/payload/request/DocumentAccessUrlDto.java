package com.skapp.enterprise.esignature.payload.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.skapp.enterprise.esignature.type.DocumentPermissionType;
import com.skapp.enterprise.esignature.util.deserializer.DocumentPermissionTypeDeserializer;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DocumentAccessUrlDto {

	@NotNull
	private Long documentId;

	@NotNull
	private Long recipientId;

	@NotNull(message = "{validation.document.permission.type.invalid}")
	@JsonDeserialize(using = DocumentPermissionTypeDeserializer.class)
	private DocumentPermissionType permissionType;

}
