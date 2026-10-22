package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.model.CrmActivityCall;
import com.skapp.community.crmplanner.model.CrmActivityCall_;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmCompany_;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.payload.response.CrmActivityCallResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityCallRepository;
import com.skapp.community.crmplanner.type.CrmActivityCallFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityCallSort;
import com.skapp.community.crmplanner.type.CrmActivityScope;
import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeManager_;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.EmployeeTeam_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.model.Team_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.AbstractQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmActivityCallRepositoryImpl implements CrmActivityCallRepository {

	private final EntityManager entityManager;

	@Override
	public List<CrmActivityCallResponseDto> findCalls(CrmActivityCallFilterParams params) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityCallResponseDto> query = cb.createQuery(CrmActivityCallResponseDto.class);
		Root<CrmActivityCall> call = query.from(CrmActivityCall.class);

		Join<CrmActivityCall, CrmCompany> company = call.join(CrmActivityCall_.company, JoinType.LEFT);
		company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));

		query.select(cb.construct(CrmActivityCallResponseDto.class, call.get(CrmActivityCall_.id),
				call.get(CrmActivityCall_.subject), call.get(CrmActivityCall_.durationMinutes),
				call.get(CrmActivityCall_.loggedAt), call.get(CrmActivityCall_.owner).get(Employee_.employeeId),
				call.get(CrmActivityCall_.contact).get(CrmContact_.id),
				call.get(CrmActivityCall_.deal).get(CrmDeal_.id), company.get(CrmCompany_.id)));
		query.where(buildCallPredicates(cb, query, call, params).toArray(new Predicate[0]))
			.orderBy(buildCallOrder(cb, call, params.getSortKey(), params.getSortOrder()));

		return entityManager.createQuery(query).getResultList();
	}

	private List<Predicate> buildCallPredicates(CriteriaBuilder cb, AbstractQuery<?> query, Root<CrmActivityCall> call,
			CrmActivityCallFilterParams params) {
		List<Predicate> predicates = new ArrayList<>();
		Path<Long> ownerId = call.get(CrmActivityCall_.owner).get(Employee_.employeeId);

		predicates.add(cb.isFalse(call.get(CrmActivityCall_.isDeleted)));

		if (params.getScope() == CrmActivityScope.SELF) {
			predicates.add(cb.equal(ownerId, params.getCurrentEmployeeId()));
		}

		if (params.getScope() == CrmActivityScope.TEAM) {
			predicates.add(buildTeamScopePredicate(cb, query, ownerId, params.getCurrentEmployeeId()));
		}

		if (params.getOwnerId() != null) {
			predicates.add(cb.equal(ownerId, params.getOwnerId()));
		}

		if (params.getLoggedFrom() != null) {
			predicates.add(cb.greaterThanOrEqualTo(call.get(CrmActivityCall_.loggedAt), params.getLoggedFrom()));
		}

		if (params.getLoggedBefore() != null) {
			predicates.add(cb.lessThan(call.get(CrmActivityCall_.loggedAt), params.getLoggedBefore()));
		}

		if (!StringUtils.isNullOrBlank(params.getSearchKeyword())) {
			predicates.add(buildSearchPredicate(cb, call, params.getSearchKeyword()));
		}

		return predicates;
	}

	private Predicate buildTeamScopePredicate(CriteriaBuilder cb, AbstractQuery<?> query, Path<Long> ownerId,
			Long managerId) {
		Subquery<Long> directReports = query.subquery(Long.class);
		Root<EmployeeManager> employeeManager = directReports.from(EmployeeManager.class);
		directReports.select(employeeManager.get(EmployeeManager_.employee).get(Employee_.employeeId))
			.where(cb.equal(employeeManager.get(EmployeeManager_.manager).get(Employee_.employeeId), managerId),
					cb.equal(employeeManager.get(EmployeeManager_.managerType), ManagerType.PRIMARY));

		Subquery<Long> supervisedTeams = query.subquery(Long.class);
		Root<EmployeeTeam> supervisor = supervisedTeams.from(EmployeeTeam.class);
		supervisedTeams.select(supervisor.get(EmployeeTeam_.team).get(Team_.teamId))
			.where(cb.equal(supervisor.get(EmployeeTeam_.employee).get(Employee_.employeeId), managerId),
					cb.isTrue(supervisor.get(EmployeeTeam_.isSupervisor)),
					cb.isTrue(supervisor.get(EmployeeTeam_.team).get(Team_.isActive)));

		Subquery<Long> teamMembers = query.subquery(Long.class);
		Root<EmployeeTeam> member = teamMembers.from(EmployeeTeam.class);
		teamMembers.select(member.get(EmployeeTeam_.employee).get(Employee_.employeeId))
			.where(member.get(EmployeeTeam_.team).get(Team_.teamId).in(supervisedTeams));

		return cb.or(cb.equal(ownerId, managerId), ownerId.in(directReports), ownerId.in(teamMembers));
	}

	private Predicate buildSearchPredicate(CriteriaBuilder cb, Root<CrmActivityCall> call, String searchKeyword) {
		String pattern = "%" + StringUtils.escapeLikePattern(searchKeyword.trim().toLowerCase()) + "%";

		Join<CrmActivityCall, CrmContact> contact = call.join(CrmActivityCall_.contact, JoinType.LEFT);
		contact.on(cb.isFalse(contact.get(CrmContact_.isDeleted)));
		Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
		contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));

		return cb.or(cb.like(cb.lower(call.get(CrmActivityCall_.subject)), pattern),
				cb.like(cb.lower(contact.get(CrmContact_.name)), pattern),
				cb.like(cb.lower(contactCompany.get(CrmCompany_.name)), pattern));
	}

	private List<Order> buildCallOrder(CriteriaBuilder cb, Root<CrmActivityCall> call, CrmActivityCallSort sortKey,
			Sort.Direction sortOrder) {
		List<Order> orders = new ArrayList<>();

		if (sortKey == CrmActivityCallSort.OWNER) {
			Join<CrmActivityCall, Employee> owner = call.join(CrmActivityCall_.owner, JoinType.LEFT);
			orders.add(toOrder(cb, owner.get(Employee_.firstName), sortOrder));
			orders.add(toOrder(cb, owner.get(Employee_.lastName), sortOrder));
		}

		orders.add(toOrder(cb, call.get(CrmActivityCall_.loggedAt), sortOrder));
		orders.add(toOrder(cb, call.get(CrmActivityCall_.id), sortOrder));

		return orders;
	}

	private Order toOrder(CriteriaBuilder cb, Expression<?> expression, Sort.Direction sortOrder) {
		return sortOrder.isAscending() ? cb.asc(expression) : cb.desc(expression);
	}

}
