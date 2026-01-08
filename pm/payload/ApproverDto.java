package com.skapp.enterprise.pm.payload;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

import com.skapp.enterprise.pm.enums.ReleaseApprovalStatusEnum;

@Getter
@Setter
public class ApproverDto {

	private String name;

	private String role;

	private String profilePicture;

	private ReleaseApprovalStatusEnum status;

	private LocalDateTime actionDate;

	private String remarks;

}
