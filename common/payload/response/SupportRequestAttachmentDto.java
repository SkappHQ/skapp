package com.skapp.enterprise.common.payload.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SupportRequestAttachmentDto {

	private String filePath;

	public SupportRequestAttachmentDto(String filePath) {
		this.filePath = filePath;
	}

}
