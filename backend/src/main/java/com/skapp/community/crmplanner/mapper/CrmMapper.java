package com.skapp.community.crmplanner.mapper;

import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmPriority;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.payload.response.*;
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
	@Mapping(target = "lastContactedAt", source = "lastContactAt")
	@Mapping(target = "lastModifiedDate", source = "lastModifiedDate")
	CrmContactResponseDto crmContactToCrmContactResponseDto(CrmContact contact);

	@Mapping(target = "company", source = "company")
	@Mapping(target = "owner", source = "owner")
	@Mapping(target = "lastContactedAt", source = "lastContactAt")
	@Mapping(target = "lastModifiedDate", source = "lastModifiedDate")
	@Mapping(target = "closedDealValue", ignore = true)
	@Mapping(target = "closedDealCount", ignore = true)
	@Mapping(target = "pipelineDealValue", ignore = true)
	@Mapping(target = "activeDealCount", ignore = true)
	@Mapping(target = "openTaskCount", ignore = true)
	@Mapping(target = "overdueTaskCount", ignore = true)
	CrmContactListItemDto crmContactToCrmContactListItemDto(CrmContact contact);

	@Mapping(target = "stageId", source = "stage.id")
	@Mapping(target = "stageName", source = "stage.name")
	@Mapping(target = "priorityId", source = "priority.id")
	@Mapping(target = "priorityName", source = "priority.name")
	@Mapping(target = "ownerId", source = "owner.employeeId")
	@Mapping(target = "ownerName", source = "owner.fullName")
	@Mapping(target = "companyId", source = "company.id")
	@Mapping(target = "companyName", source = "company.name")
	CrmDealResponseDto crmDealToCrmDealResponseDto(CrmDeal deal);

	CrmDealStageResponseDto crmDealStageToCrmDealStageResponseDto(CrmDealStage stage);

	CrmPriorityResponseDto crmPriorityToCrmPriorityResponseDto(CrmPriority priority);

	@Mapping(target = "type", source = "type")
	@Mapping(target = "priority", source = "priority")
	@Mapping(target = "owner", source = "owner")
	CrmTaskResponseDto crmTaskToCrmTaskResponseDto(CrmTask task);

	CrmTaskTypeResponseDto crmTaskTypeToCrmTaskTypeResponseDto(CrmTaskType type);

	CrmContactLookupResponseDto crmContactToCrmContactLookupResponseDto(CrmContact contact);

}
