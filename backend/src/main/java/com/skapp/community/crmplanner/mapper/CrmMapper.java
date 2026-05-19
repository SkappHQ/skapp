package com.skapp.community.crmplanner.mapper;

import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.response.CrmCompanyLookupResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactResponseDto;
import com.skapp.community.peopleplanner.model.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CrmMapper {

	CrmCompanyLookupResponseDto crmCompanyToCrmCompanyLookupResponseDto(CrmCompany company);

	@Mapping(target = "email", source = "user.email")
	@Mapping(target = "crmRole", source = "employeeRole.crmRole")
	@Mapping(target = "authPic", source = "authPic")
	CrmContactOwnerResponseDto employeeToCrmContactOwnerResponseDto(Employee employee);

	@Mapping(target = "company", source = "company")
	@Mapping(target = "owner", source = "owner")
	CrmContactResponseDto crmContactToCrmContactResponseDto(CrmContact contact);

}
