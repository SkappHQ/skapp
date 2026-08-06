package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.LeaveDuration;
import lombok.Getter;
import lombok.Setter;

/**
 * Full leave-type detail needed by the apply-leave modal — duration rules and the
 * comment/attachment requirements. The lighter {@link PolicyLeaveTypeResponseDto} used by
 * the admin screens stays untouched.
 */
@Getter
@Setter
public class PolicyLeaveTypeDetailResponseDto {

	private Long id;

	private String name;

	private String emojiCode;

	private String colorCode;

	private LeaveDuration minDuration;

	private Boolean isAttachment;

	private Boolean isAttachmentMust;

	private Boolean isCommentMust;

	private Boolean isAutoApproval;

}
