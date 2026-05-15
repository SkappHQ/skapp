package com.skapp.community.crmplanner.mapper;

import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmPriority;
import com.skapp.community.crmplanner.payload.response.CrmDealResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealStageResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmPriorityResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CrmDealMapper {

	@Mapping(target = "stageId", source = "stage.id")
	@Mapping(target = "stageName", source = "stage.name")
	@Mapping(target = "priorityId", source = "priority.id")
	@Mapping(target = "priorityName", source = "priority.name")
	@Mapping(target = "companyId", source = "company.id")
	@Mapping(target = "companyName", source = "company.name")
	@Mapping(target = "contactId", source = "contact.id")
	@Mapping(target = "contactName", source = "contact.name")
	@Mapping(target = "ownerId", source = "owner.employeeId")
	@Mapping(target = "ownerName", source = "owner.fullName")
	CrmDealResponseDto crmDealToCrmDealResponseDto(CrmDeal crmDeal);

	List<CrmDealResponseDto> crmDealsToCrmDealResponseDtos(List<CrmDeal> crmDeals);

	CrmDealStageResponseDto crmDealStageToCrmDealStageResponseDto(CrmDealStage crmDealStage);

	List<CrmDealStageResponseDto> crmDealStagesToCrmDealStageResponseDtos(List<CrmDealStage> crmDealStages);

	CrmPriorityResponseDto crmPriorityToCrmPriorityResponseDto(CrmPriority crmPriority);

	List<CrmPriorityResponseDto> crmPrioritiesToCrmPriorityResponseDtos(List<CrmPriority> crmPriorities);

}
