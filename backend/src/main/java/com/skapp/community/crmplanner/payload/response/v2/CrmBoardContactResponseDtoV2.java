package com.skapp.community.crmplanner.payload.response.v2;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmBoardContactResponseDtoV2 {

	private Long id;

	private String name;

	private Long companyId;

}
