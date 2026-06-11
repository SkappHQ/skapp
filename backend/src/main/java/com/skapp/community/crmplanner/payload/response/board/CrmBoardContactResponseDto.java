package com.skapp.community.crmplanner.payload.response.board;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmBoardContactResponseDto {

	private Long id;

	private String name;

	private CrmBoardContactCompanyResponseDto company;

}
