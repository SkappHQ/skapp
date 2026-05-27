package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.type.CrmDealSummary;

import java.util.List;

public interface CrmDealRepository {

	List<CrmDealSummary> findClosedDealSummaryByContactIds(List<Long> contactIds);

}
