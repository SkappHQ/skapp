package com.skapp.community.crmplanner.mapper;

import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.response.v2.CrmContactResponseDtoV2;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CrmMapperV2 {

	@Mapping(target = "companyId", source = "company.id")
	@Mapping(target = "ownerId", source = "owner.employeeId")
	CrmContactResponseDtoV2 crmContactToCrmContactResponseDtoV2(CrmContact contact);

}
