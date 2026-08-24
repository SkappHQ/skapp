package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

/**
 * Repositions a deal in the list (table) view. The moved deal lands between
 * {@code previousDealId} and {@code nextDealId}; either may be null when the deal moves
 * to the start or end of the list.
 */
@Getter
@Setter
public class CrmDealListReorderRequestDto {

	private Long dealId;

	private Long previousDealId;

	private Long nextDealId;

}
