package com.skapp.community.crmplanner.util;

import com.skapp.community.crmplanner.type.CrmActivityListParams;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import lombok.experimental.UtilityClass;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@UtilityClass
public class CrmActivityScopeUtil {

	public List<Predicate> buildScopePredicates(CriteriaBuilder cb, Path<Long> ownerId, Path<Instant> dateField,
			CrmActivityListParams params) {
		List<Predicate> predicates = new ArrayList<>();

		if (Boolean.TRUE.equals(params.getIsRestrictedToOwner())) {
			predicates.add(cb.equal(ownerId, params.getCurrentEmployeeId()));
		}

		if (params.getOwnerId() != null) {
			predicates.add(cb.equal(ownerId, params.getOwnerId()));
		}

		if (params.getRangeStart() != null) {
			predicates.add(cb.greaterThanOrEqualTo(dateField, params.getRangeStart()));
		}

		if (params.getRangeEnd() != null) {
			predicates.add(cb.lessThan(dateField, params.getRangeEnd()));
		}

		return predicates;
	}

}
