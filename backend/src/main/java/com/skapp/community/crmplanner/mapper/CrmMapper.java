package com.skapp.community.crmplanner.mapper;

import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyLookupResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactDetailResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealDetailResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealStageResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskDetailResponseDto;
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

	@Mapping(target = "totalRevenue", ignore = true)
	@Mapping(target = "pipelineRevenue", ignore = true)
	@Mapping(target = "activeDealsCount", ignore = true)
	@Mapping(target = "openTasksCount", ignore = true)
	@Mapping(target = "overdueTasksCount", ignore = true)
	@Mapping(target = "deals", ignore = true)
	@Mapping(target = "tasks", ignore = true)
	CrmContactDetailResponseDto crmContactToCrmContactDetailResponseDto(CrmContact contact);

	@Mapping(target = "value", source = "amount")
	CrmDealDetailResponseDto crmDealToCrmDealDetailResponseDto(CrmDeal deal);

	CrmDealStageResponseDto crmDealStageToCrmDealStageResponseDto(CrmDealStage stage);

	@Mapping(target = "type", source = "type.name")
	@Mapping(target = "priority", source = "priority.name")
	@Mapping(target = "isOverdue", ignore = true)
	CrmTaskDetailResponseDto crmTaskToCrmTaskDetailResponseDto(CrmTask task);

}
