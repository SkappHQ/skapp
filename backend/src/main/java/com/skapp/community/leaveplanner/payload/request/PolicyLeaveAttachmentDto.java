package com.skapp.community.leaveplanner.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PolicyLeaveAttachmentDto {

	@NotBlank
	private String fileUrl;

	private String originalFileName;

}
