package com.skapp.community.leaveplanner.payload.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PolicyLeaveAttachmentDto {

	private String fileUrl;

	private String originalFileName;

}
