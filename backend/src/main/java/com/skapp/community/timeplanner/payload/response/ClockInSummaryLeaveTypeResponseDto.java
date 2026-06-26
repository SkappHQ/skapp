package com.skapp.community.timeplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClockInSummaryLeaveTypeResponseDto {

	private Long typeId;

	private String name;

	private String emojiCode;

	private String colorCode;

}
