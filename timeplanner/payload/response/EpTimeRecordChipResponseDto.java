package com.skapp.enterprise.timeplanner.payload.response;

import com.skapp.community.timeplanner.payload.response.TimeRecordChipResponseDto;
import com.skapp.enterprise.timeplanner.type.RecordLocationStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpTimeRecordChipResponseDto extends TimeRecordChipResponseDto {

	private RecordLocationStatus clockInLocationStatus;

	private RecordLocationStatus clockOutLocationStatus;

}
