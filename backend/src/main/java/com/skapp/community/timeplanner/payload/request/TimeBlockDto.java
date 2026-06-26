package com.skapp.community.timeplanner.payload.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@RequiredArgsConstructor
public class TimeBlockDto {

	private String morningTimeBlock;

	private String morningHours;

	private String eveningTimeBlock;

	private String eveningHours;

}
