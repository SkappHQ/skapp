package com.skapp.community.crmplanner.payload.response.v2;

import com.skapp.community.crmplanner.payload.response.CrmTaskTypeResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardContactResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardStageResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CrmBoardInitDataResponseDtoV2 {

	private List<CrmBoardStageResponseDto> stages;

	private List<CrmBoardContactResponseDto> contacts;

	private List<String> crmRoles;

	private List<CrmBoardOwnerResponseDto> owners;

	private List<CrmTaskTypeResponseDto> taskTypes;

	private List<CrmIndustryResponseDto> industries;

}
