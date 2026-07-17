package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.CalculationType;
import com.skapp.community.leaveplanner.type.LeaveDuration;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class LeaveTypeResponseDto {

	private Long typeId;

	@NotNull
	private String name;

	@NotNull
	private String emojiCode;

	@NotNull
	private String colorCode;

	@NotNull
	private CalculationType calculationType;

	@NotNull
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
