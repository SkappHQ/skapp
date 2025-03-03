package com.skapp.enterprise.peopleplanner.payload.response;

import com.skapp.enterprise.peopleplanner.type.EpEmployeeTimelineType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EpEmployeeTimelineResponseDto {

	private Long id;

	private EpEmployeeTimelineType timelineType;

	private String previousValue;

	private String newValue;

	private LocalDate date;

	private String createdBy;

}
