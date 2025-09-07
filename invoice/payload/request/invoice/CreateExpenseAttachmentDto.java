package com.skapp.enterprise.invoice.payload.request.invoice;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateExpenseAttachmentDto {

	@NotBlank(message = "Attachment URL is required")
	private String attachmentUrl;

}
