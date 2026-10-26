package com.skapp.community.crmplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CrmActivityFeedAssociationResponseDto {

	private Long id;

	private String name;

	private Boolean isDeleted;

}
