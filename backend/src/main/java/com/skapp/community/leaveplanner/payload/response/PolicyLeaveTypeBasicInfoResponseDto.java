package com.skapp.community.leaveplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PolicyLeaveTypeBasicInfoResponseDto {

	private Long typeId;

	private String name;

	private String colorCode;

	private String emojiCode;

}
