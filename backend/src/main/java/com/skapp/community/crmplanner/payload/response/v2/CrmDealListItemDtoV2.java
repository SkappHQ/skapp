package com.skapp.community.crmplanner.payload.response.v2;

import com.skapp.community.crmplanner.type.CrmDealPriority;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * A deal carrying id references only, so the client resolves them against the entities it
 * already holds instead of receiving another copy nested inside every deal. Used by the
 * batch lookup, which exists to hydrate a client store that is keyed by id.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmDealListItemDtoV2 {

	private Long id;

	private String name;

	private String description;

	private CrmDealPriority priority;

	private String orderIndex;

	private String amount;

	private LocalDateTime closingAt;

	private Long stageId;

	private Long ownerId;

	private Long companyId;

	private Long contactId;

}
