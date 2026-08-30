package com.skapp.community.crmplanner.mapper;

import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.response.v2.CrmContactResponseDtoV2;
import com.skapp.community.crmplanner.payload.response.v2.CrmDealResponseDtoV2;
import com.skapp.community.crmplanner.payload.response.v2.CrmTaskResponseDtoV2;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = CrmMapper.class)
public interface CrmMapperV2 {

	CrmContactResponseDtoV2 crmContactToCrmContactResponseDtoV2(CrmContact contact);

	@Mapping(target = "stageId", source = "stage.id")
	@Mapping(target = "ownerId", source = "owner.employeeId")
	@Mapping(target = "companyId", source = "company.id")
	@Mapping(target = "contactId", source = "contact.id")
	CrmDealResponseDtoV2 crmDealToCrmDealResponseDtoV2(CrmDeal deal);

	@Mapping(target = "typeId", source = "type.id")
	@Mapping(target = "ownerId", source = "owner.employeeId")
	@Mapping(target = "contactId", source = "contact.id")
	@Mapping(target = "companyId", source = "company.id")
	@Mapping(target = "dealId", source = "deal.id")
	CrmTaskResponseDtoV2 crmTaskToCrmTaskResponseDtoV2(CrmTask task);

}
