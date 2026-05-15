package com.skapp.enterprise.timeplanner.payload.request;

import com.skapp.community.timeplanner.payload.request.AddTimeRecordDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpAddTimeRecordDto extends AddTimeRecordDto {

	private Double latitude;

	private Double longitude;

}
