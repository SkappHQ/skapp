package com.skapp.community.crmplanner.activity.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.crmplanner.activity.payload.response.CrmActivityPersonResponseDto;
import com.skapp.community.crmplanner.activity.repository.CrmActivityTeamMemberRepository;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeRole_;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmActivityTeamMemberRepositoryImpl implements CrmActivityTeamMemberRepository {

	private static final char LIKE_ESCAPE = '\\';

	private final EntityManager entityManager;

	@Override
	public List<CrmActivityPersonResponseDto> findAllCrmMembers(String searchPattern) {
		return findCrmMembers(null, searchPattern);
	}

	@Override
	public List<CrmActivityPersonResponseDto> findCrmMembersByEmployeeIds(Collection<Long> employeeIds,
			String searchPattern) {
		if (employeeIds == null || employeeIds.isEmpty()) {
			return Collections.emptyList();
		}
		return findCrmMembers(employeeIds, searchPattern);
	}

	private List<CrmActivityPersonResponseDto> findCrmMembers(Collection<Long> employeeIds, String searchPattern) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityPersonResponseDto> query = cb.createQuery(CrmActivityPersonResponseDto.class);
		Root<Employee> employee = query.from(Employee.class);
		Join<Employee, User> user = employee.join(Employee_.user, JoinType.INNER);
		Join<Employee, EmployeeRole> employeeRole = employee.join(Employee_.employeeRole, JoinType.INNER);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isTrue(user.get(User_.isActive)));
		predicates.add(employeeRole.get(EmployeeRole_.crmRole).in(CrmConstants.ASSIGNABLE_CRM_ROLES));

		if (employeeIds != null) {
			predicates.add(employee.get(Employee_.employeeId).in(employeeIds));
		}

		if (searchPattern != null) {
			Expression<String> fullName = cb.concat(cb.concat(employee.get(Employee_.firstName), " "),
					employee.get(Employee_.lastName));
			predicates.add(cb.or(cb.like(cb.lower(employee.get(Employee_.firstName)), searchPattern, LIKE_ESCAPE),
					cb.like(cb.lower(employee.get(Employee_.lastName)), searchPattern, LIKE_ESCAPE),
					cb.like(cb.lower(fullName), searchPattern, LIKE_ESCAPE)));
		}

		query.select(cb.construct(CrmActivityPersonResponseDto.class, employee.get(Employee_.employeeId),
				employee.get(Employee_.firstName), employee.get(Employee_.lastName), employee.get(Employee_.authPic)))
			.where(predicates.toArray(new Predicate[0]))
			.orderBy(cb.asc(cb.lower(employee.get(Employee_.firstName))),
					cb.asc(cb.lower(employee.get(Employee_.lastName))), cb.asc(employee.get(Employee_.employeeId)));

		return entityManager.createQuery(query).getResultList();
	}

}
