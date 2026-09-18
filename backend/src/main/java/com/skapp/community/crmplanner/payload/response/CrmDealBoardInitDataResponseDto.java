package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CrmDealBoardInitDataResponseDto {

	private List<CrmDealStageResponseDto> stages;

	private List<CrmContactLookupResponseDto> contacts;

	private List<String> crmRoles;

	private List<CrmOwnerResponseDto> owners;

}
