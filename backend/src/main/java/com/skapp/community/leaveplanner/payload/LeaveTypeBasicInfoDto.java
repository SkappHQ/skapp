package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LeaveTypeBasicInfoDto {

	private Long typeId;

	private String name;

	private String colorCode;

	private String emojiCode;

}
