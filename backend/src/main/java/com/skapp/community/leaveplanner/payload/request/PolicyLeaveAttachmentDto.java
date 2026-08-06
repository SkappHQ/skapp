package com.skapp.community.leaveplanner.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One uploaded file on a policy leave request. {@code fileUrl} is the storage handle the
 * upload returned; {@code originalFileName} is what the employee called the file, kept so
 * the UI can label and download it by its real name.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PolicyLeaveAttachmentDto {

	@NotBlank
	private String fileUrl;

	private String originalFileName;

}
