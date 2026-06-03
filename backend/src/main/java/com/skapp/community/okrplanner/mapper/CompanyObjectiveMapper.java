package com.skapp.community.okrplanner.mapper;

import com.skapp.community.okrplanner.model.CompanyObjective;
import com.skapp.community.okrplanner.payload.request.CompanyObjectiveRequestDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CompanyObjectiveMapper {

	CompanyObjective companyObjectiveRequestDtoToCompanyObjective(
			CompanyObjectiveRequestDto companyObjectiveRequestDto);

}
