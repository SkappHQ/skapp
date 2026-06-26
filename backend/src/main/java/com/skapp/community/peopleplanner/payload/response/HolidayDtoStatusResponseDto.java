package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.HolidayRequestDto;
import com.skapp.community.peopleplanner.type.BulkRecordStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class HolidayDtoStatusResponseDto {

	BulkRecordStatus status;

	String errorMessage;

	HolidayRequestDto holiday;

}
