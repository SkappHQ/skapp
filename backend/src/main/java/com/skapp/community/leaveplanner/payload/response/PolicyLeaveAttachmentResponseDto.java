package com.skapp.community.leaveplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PolicyLeaveAttachmentResponseDto {

	private Long id;

	/** Storage handle: a bare filename on community, an S3 key on enterprise. */
	private String fileUrl;

	/** The name the employee uploaded the file under. May be null for older rows. */
	private String originalFileName;

}
