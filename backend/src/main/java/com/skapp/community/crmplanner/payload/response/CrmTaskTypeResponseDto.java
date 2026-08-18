package com.skapp.community.crmplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmTaskTypeResponseDto {

	private Long id;

	private String name;

	private Integer orderIndex;

}
