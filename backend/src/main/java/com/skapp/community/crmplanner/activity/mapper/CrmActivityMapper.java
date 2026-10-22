package com.skapp.community.crmplanner.activity.mapper;

import com.skapp.community.crmplanner.activity.payload.response.CrmActivityTaskResponseDto;
import com.skapp.community.crmplanner.model.CrmActivityTask;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CrmActivityMapper {

	@Mapping(target = "ownerId", source = "owner.employeeId")
	@Mapping(target = "contactId", source = "contact.id")
	@Mapping(target = "companyId", source = "company.id")
	@Mapping(target = "dealId", source = "deal.id")
	CrmActivityTaskResponseDto crmActivityTaskToCrmActivityTaskResponseDto(CrmActivityTask task);

}
