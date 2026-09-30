package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmIndustry;

import java.util.List;

public interface CrmIndustryRepository {

	void insertAll(List<CrmIndustry> industries);

}
