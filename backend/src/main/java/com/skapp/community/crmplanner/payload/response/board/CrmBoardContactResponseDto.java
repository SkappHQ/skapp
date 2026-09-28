package com.skapp.community.crmplanner.payload.response.board;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmBoardContactResponseDto {

	private Long id;

	private String name;

	private Long companyId;

}
