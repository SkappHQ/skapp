package com.skapp.community.crmplanner.util;

import com.skapp.community.common.model.User;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.response.CrmContactDetailResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactListItemDto;
import com.skapp.community.crmplanner.payload.response.CrmContactLookupResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardContactResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmDealByStageItemResponseDto;

import lombok.experimental.UtilityClass;

@UtilityClass
public class CrmUtil {

	public boolean isCrmSalesRepresentative(User user) {
		return user.getEmployee().getEmployeeRole().getCrmRole() == Role.CRM_SALES_REPRESENTATIVE;
	}

	public boolean hasDeletedCompany(CrmContact contact) {
		return isCompanyDeleted(contact.getCompany());
	}

	public boolean hasDeletedCompany(CrmDeal deal) {
		return isCompanyDeleted(deal.getCompany());
	}

	private boolean isCompanyDeleted(CrmCompany company) {
		return company != null && Boolean.TRUE.equals(company.getIsDeleted());
	}

	public CrmContactLookupResponseDto toContactLookupDto(CrmMapper crmMapper, CrmContact contact) {
		CrmContactLookupResponseDto dto = crmMapper.crmContactToCrmContactLookupResponseDto(contact);
		if (hasDeletedCompany(contact)) {
			dto.setCompany(null);
		}
		return dto;
	}

	public CrmContactListItemDto toContactListItemDto(CrmMapper crmMapper, CrmContact contact) {
		CrmContactListItemDto dto = crmMapper.crmContactToCrmContactListItemDto(contact);
		if (hasDeletedCompany(contact)) {
			dto.setCompany(null);
		}
		return dto;
	}

	public CrmContactDetailResponseDto toContactDetailDto(CrmMapper crmMapper, CrmContact contact) {
		CrmContactDetailResponseDto dto = crmMapper.crmContactToCrmContactDetailResponseDto(contact);
		if (hasDeletedCompany(contact)) {
			dto.setCompany(null);
		}
		return dto;
	}

	public CrmBoardContactResponseDto toBoardContactDto(CrmMapper crmMapper, CrmContact contact) {
		CrmBoardContactResponseDto dto = crmMapper.crmContactToCrmBoardContactResponseDto(contact);
		if (hasDeletedCompany(contact)) {
			dto.setCompany(null);
		}
		return dto;
	}

	public CrmDealResponseDto toDealResponseDto(CrmMapper crmMapper, CrmDeal deal) {
		CrmDealResponseDto dto = crmMapper.crmDealToCrmDealResponseDto(deal);
		if (hasDeletedCompany(deal)) {
			dto.setCompanyName(null);
		}
		return dto;
	}

	public CrmDealByStageItemResponseDto toDealByStageItemDto(CrmMapper crmMapper, CrmDeal deal) {
		CrmDealByStageItemResponseDto dto = crmMapper.crmDealToCrmDealByStageItemResponseDto(deal);
		if (hasDeletedCompany(deal)) {
			dto.setCompanyId(null);
		}
		return dto;
	}

}
