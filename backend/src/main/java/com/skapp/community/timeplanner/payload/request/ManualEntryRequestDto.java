package com.skapp.community.timeplanner.payload.request;

import com.skapp.community.peopleplanner.type.RequestType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ManualEntryRequestDto extends TimeRequestDto {

	public ManualEntryRequestDto() {
		super.setRequestType(RequestType.MANUAL_ENTRY_REQUEST);
	}

}
