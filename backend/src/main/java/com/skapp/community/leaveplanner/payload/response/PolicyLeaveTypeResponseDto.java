package com.skapp.community.leaveplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PolicyLeaveTypeResponseDto {

	private Long typeId;

	private String name;

	private String emojiCode;

	private String colorCode;

}
