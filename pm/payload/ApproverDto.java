package com.skapp.enterprise.pm.payload;

import com.skapp.enterprise.pm.enums.ReleaseApprovalStatusEnum;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

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
