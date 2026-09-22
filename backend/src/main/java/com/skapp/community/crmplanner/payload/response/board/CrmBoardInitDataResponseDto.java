package com.skapp.community.crmplanner.payload.response.board;

import com.skapp.community.crmplanner.payload.response.CrmTaskTypeResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CrmBoardInitDataResponseDto {

	private List<CrmBoardStageResponseDto> stages;

	private List<CrmBoardContactResponseDto> contacts;

	private List<String> crmRoles;

	private List<CrmBoardOwnerResponseDto> owners;

	private List<CrmTaskTypeResponseDto> taskTypes;

}
