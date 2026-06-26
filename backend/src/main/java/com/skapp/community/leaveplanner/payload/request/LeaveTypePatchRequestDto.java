package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.CalculationType;
import com.skapp.community.leaveplanner.type.LeaveDuration;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class LeaveTypePatchRequestDto {

	private String name;

	private String emojiCode;

	private String colorCode;

	private CalculationType calculationType;

	private LeaveDuration leaveDuration;

	private float maxCarryForwardDays;

	private float carryForwardExpirationDays;

	private LocalDate carryForwardExpirationDate;

	private Boolean isAttachment;

	private Boolean isOverridden;

	private Boolean isAttachmentMandatory;

	private Boolean isCommentMandatory;

	private Boolean isAutoApproval;

	private Boolean isActive;

	private Boolean isCarryForwardEnabled;

	private Boolean isCarryForwardRemainingBalanceEnabled;

}
