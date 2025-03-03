package com.skapp.enterprise.peopleplanner.mapper;

import com.skapp.community.peopleplanner.model.EmployeeProgression;
import com.skapp.community.peopleplanner.payload.request.EmployeeProgressionsDto;
import com.skapp.enterprise.peopleplanner.model.EmployeeTimeline;
import com.skapp.enterprise.peopleplanner.payload.response.EpEmployeeTimelineResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EpPeopleMapper {

	@Mapping(target = "id", source = "id")
	@Mapping(target = "date", expression = "java(employeeTimeline.getLastModifiedDate().toLocalDate())")
	EpEmployeeTimelineResponseDto employeeTimelineToEmployeeTimelineResponseDto(EmployeeTimeline employeeTimeline);

	List<EpEmployeeTimelineResponseDto> employeeTimelinesToEmployeeTimelineResponseDtoList(
			List<EmployeeTimeline> employeeTimelines);

	EmployeeProgressionsDto employeeProgressionToEmployeeProgressionDto(EmployeeProgression employeeProgression);

}
