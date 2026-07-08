package com.skapp.community.crmplanner.util;

import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmCompany_;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.experimental.UtilityClass;

@UtilityClass
public class CrmQueryUtil {

	public Predicate companyNotDeleted(CriteriaBuilder cb, Join<?, CrmCompany> company) {
		return cb.or(cb.isNull(company), cb.isFalse(company.get(CrmCompany_.isDeleted)));
	}

}
