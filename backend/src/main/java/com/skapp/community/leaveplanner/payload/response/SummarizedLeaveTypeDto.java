package com.skapp.community.leaveplanner.payload.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SummarizedLeaveTypeDto {

	private Long typeId;

	private String name;

	private String emojiCode;

}
