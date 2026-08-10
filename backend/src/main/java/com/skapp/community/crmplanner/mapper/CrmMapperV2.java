package com.skapp.community.crmplanner.mapper;

import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.response.v2.CrmContactResponseDtoV2;
import com.skapp.community.crmplanner.payload.response.v2.CrmDealResponseDtoV2;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = CrmMapper.class)
public interface CrmMapperV2 {

	CrmContactResponseDtoV2 crmContactToCrmContactResponseDtoV2(CrmContact contact);

	CrmDealResponseDtoV2 crmDealToCrmDealResponseDtoV2(CrmDeal deal);

}
