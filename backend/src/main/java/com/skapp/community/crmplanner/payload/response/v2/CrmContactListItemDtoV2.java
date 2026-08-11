package com.skapp.community.crmplanner.payload.response.v2;

import com.skapp.community.crmplanner.type.CrmContactMetrics;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CrmContactListItemDtoV2 {

	private CrmContactResponseDtoV2 contact;

	private CrmContactMetrics metrics;

}
