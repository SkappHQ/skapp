package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CrmDealIdsRequestDto {

	private List<Long> ids;

}
