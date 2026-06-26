package com.skapp.community.peopleplanner.payload.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class HolidayRequestDto {

	@NotNull
	private String date;

	@NotNull
	private String name;

	@NotNull
	private String holidayDuration;

	private List<String> workLocations;

}
