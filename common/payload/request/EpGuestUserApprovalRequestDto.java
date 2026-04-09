package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.pm.type.GuestUserApprovalStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpGuestUserApprovalRequestDto {

	private Long id;

	private GuestUserApprovalStatus status;

	private String projectName;

	private String approverEmail;

}
