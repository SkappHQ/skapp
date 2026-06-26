package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.type.HolidayDuration;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HolidayBasicDetailsResponseDto {

	private Long id;

	private String name;

	private HolidayDuration holidayDuration;

}
