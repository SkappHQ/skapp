package com.skapp.community.peopleplanner.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class HolidayBulkRequestDto {

	List<HolidayRequestDto> holidayDtoList;

	@NotNull
	private int year;

}
