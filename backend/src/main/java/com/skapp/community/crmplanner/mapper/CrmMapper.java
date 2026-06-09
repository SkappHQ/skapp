package com.skapp.community.crmplanner.mapper;

import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyLookupResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactDetailResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactListItemDto;
import com.skapp.community.crmplanner.payload.response.CrmContactLookupResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealDetailResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealLookupResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealStageResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskTypeResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardContactCompanyResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardContactResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardStageResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskDetailResponseDto;
import com.skapp.community.peopleplanner.model.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CrmMapper {

	@Mapping(target = "stageName", source = "stage.name")
	@Mapping(target = "stageColor", source = "stage.color")
	@Mapping(target = "companyName", source = "company.name")
	@Mapping(target = "contactName", source = "contact.name")
	@Mapping(target = "owner", source = "owner")
	CrmDealResponseDto crmDealToCrmDealResponseDto(CrmDeal crmDeal);

	List<CrmDealResponseDto> crmDealsToCrmDealResponseDtos(List<CrmDeal> crmDeals);

	CrmDealStageResponseDto crmDealStageToCrmDealStageResponseDto(CrmDealStage crmDealStage);

	List<CrmDealStageResponseDto> crmDealStagesToCrmDealStageResponseDtos(List<CrmDealStage> crmDealStages);

	CrmCompanyLookupResponseDto crmCompanyToCrmCompanyLookupResponseDto(CrmCompany company);

	CrmContactLookupResponseDto crmContactToCrmContactLookupResponseDto(CrmContact contact);

	CrmCompany crmCompanyCreateDtoToCrmCompany(CrmCompanyCreateDto crmCompanyCreateDto);

	CrmCompanyResponseDto crmCompanyToCrmCompanyResponseDto(CrmCompany crmCompany);

	@Mapping(target = "email", source = "user.email")
	CrmContactOwnerResponseDto employeeToCrmContactOwnerResponseDto(Employee employee);

	CrmOwnerResponseDto employeeToCrmDealOwnerResponseDto(Employee employee);

	CrmContactResponseDto crmContactToCrmContactResponseDto(CrmContact contact);

	@Mapping(target = "closedDealValue", ignore = true)
	@Mapping(target = "closedDealCount", ignore = true)
	@Mapping(target = "openTaskCount", ignore = true)
	@Mapping(target = "overdueTaskCount", ignore = true)
	CrmContactListItemDto crmContactToCrmContactListItemDto(CrmContact contact);

	@Mapping(target = "typeId", source = "type.id")
	@Mapping(target = "typeName", source = "type.name")
	@Mapping(target = "contactId", source = "contact.id")
	@Mapping(target = "ownerName", source = "owner.fullName")
	CrmTaskResponseDto crmTaskToCrmTaskResponseDto(CrmTask crmTask);

	List<CrmTaskTypeResponseDto> crmTaskTypesToCrmTaskTypeResponseDtos(List<CrmTaskType> crmTaskTypes);

	CrmDealLookupResponseDto crmDealToCrmDealLookupResponseDto(CrmDeal crmDeal);

	List<CrmTaskResponseDto> crmTasksToCrmTaskResponseDtos(List<CrmTask> crmTasks);

	CrmBoardStageResponseDto crmDealStageToCrmBoardStageResponseDto(CrmDealStage crmDealStage);

	List<CrmBoardStageResponseDto> crmDealStagesToCrmBoardStageResponseDtos(List<CrmDealStage> crmDealStages);

	CrmBoardContactCompanyResponseDto crmCompanyToCrmBoardContactCompanyResponseDto(CrmCompany company);

	CrmBoardContactResponseDto crmContactToCrmBoardContactResponseDto(CrmContact contact);

	List<CrmBoardContactResponseDto> crmContactsToCrmBoardContactResponseDtos(List<CrmContact> contacts);

	CrmBoardOwnerResponseDto employeeToCrmBoardOwnerResponseDto(Employee employee);
	
	CrmContactDetailResponseDto crmContactToCrmContactDetailResponseDto(CrmContact contact);

	CrmDealDetailResponseDto crmDealToCrmDealDetailResponseDto(CrmDeal deal);

	@Mapping(target = "type", source = "type.name")
	@Mapping(target = "isOverdue", ignore = true)
	CrmTaskDetailResponseDto crmTaskToCrmTaskDetailResponseDto(CrmTask task);

}
