package com.skapp.community.crmplanner.mapper;

import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyResponseDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CrmMapper {

	CrmCompany crmCompanyCreateDtoToCrmCompany(CrmCompanyCreateDto crmCompanyCreateDto);

	CrmCompanyResponseDto crmCompanyToCrmCompanyResponseDto(CrmCompany crmCompany);

}
