package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.LeaveDuration;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PolicyLeaveTypeRequestDto {

	private String name;

	private String emojiCode;

	private String colorCode;

	private LeaveDuration minDuration;

	private Boolean isAttachment;

	private Boolean isAttachmentMust;

	private Boolean isCommentMust;

	private Boolean isAutoApproval;

}
