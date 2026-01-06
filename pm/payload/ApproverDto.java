package com.skapp.enterprise.pm.payload;

import com.skapp.enterprise.pm.type.ReleaseApprovalStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ApproverDto {

	private String name;

	private String role;

	private String profilePicture;

	private ReleaseApprovalStatus status;

	private LocalDateTime actionDate;

	private String remarks;

}
