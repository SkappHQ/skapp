package com.skapp.community.crmplanner.util;

import com.skapp.community.common.model.User;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmCompany_;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.experimental.UtilityClass;

@UtilityClass
public class CrmUtil {

	public boolean isCrmSalesRepresentative(User user) {
		return user.getEmployee().getEmployeeRole().getCrmRole() == Role.CRM_SALES_REPRESENTATIVE;
	}

	public Predicate companyNotDeletedPredicate(CriteriaBuilder cb, Join<?, CrmCompany> company) {
		return cb.or(cb.isNull(company), cb.isFalse(company.get(CrmCompany_.isDeleted)));
	}

	public boolean hasDeletedCompany(CrmContact contact) {
		return isCompanyDeleted(contact.getCompany());
	}

	public boolean hasDeletedCompany(CrmDeal deal) {
		return isCompanyDeleted(deal.getCompany());
	}

	private boolean isCompanyDeleted(CrmCompany company) {
		return company != null && Boolean.TRUE.equals(company.getIsDeleted());
	}

}
