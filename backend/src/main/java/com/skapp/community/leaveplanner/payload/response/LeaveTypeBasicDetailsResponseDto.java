package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.LeaveDuration;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaveTypeBasicDetailsResponseDto {

	private Long typeId;

	private String name;

	private LeaveDuration leaveDuration;

	private String emojiCode;

	private String colorCode;

	private Boolean isCommentMandatory;

	private Boolean isAttachmentMandatory;

	private Boolean isAttachment;

}
