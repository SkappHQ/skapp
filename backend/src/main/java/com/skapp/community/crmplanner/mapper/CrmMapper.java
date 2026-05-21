package com.skapp.community.crmplanner.mapper;

import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyLookupResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactResponseDto;
import com.skapp.community.peopleplanner.model.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CrmMapper {

	CrmCompanyLookupResponseDto crmCompanyToCrmCompanyLookupResponseDto(CrmCompany company);

	CrmCompany crmCompanyCreateDtoToCrmCompany(CrmCompanyCreateDto crmCompanyCreateDto);

	CrmCompanyResponseDto crmCompanyToCrmCompanyResponseDto(CrmCompany crmCompany);

	@Mapping(target = "email", source = "user.email")
	CrmContactOwnerResponseDto employeeToCrmContactOwnerResponseDto(Employee employee);

	CrmContactResponseDto crmContactToCrmContactResponseDto(CrmContact contact);

}
