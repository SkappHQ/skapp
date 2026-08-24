package com.skapp.community.crmplanner.service;

import com.skapp.community.crmplanner.model.CrmDeal;

/**
 * Maintains the per-view fractional row ordering ({@code crm_deal_order_index}). The
 * {@code board} key mirrors {@link CrmDeal#getOrderIndex()} (per-stage Kanban order)
 * while {@code list} is an independent flat ordering for the deal table view.
 */
public interface CrmDealOrderIndexService {

	/**
	 * Creates the order-index row for a newly persisted deal: {@code board} copied from
	 * the deal's stage order index, {@code list} appended to the end of the list view.
	 * Idempotent — a no-op if a row already exists.
	 */
	void createForNewDeal(CrmDeal deal);

	/**
	 * Repositions a deal in the list view between two neighbours (either may be null for
	 * the start/end of the list), writing a fresh fractional {@code list} key.
	 */
	void reorderInList(Long dealId, Long previousDealId, Long nextDealId);

}
