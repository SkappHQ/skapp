package com.skapp.community.timeplanner.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeManager_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.payload.request.EmployeeTimeRequestFilterDto;
import com.skapp.community.peopleplanner.type.RequestStatus;
import com.skapp.community.peopleplanner.type.RequestType;
import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.model.TimeRecord_;
import com.skapp.community.timeplanner.model.TimeRequest;
import com.skapp.community.timeplanner.model.TimeRequest_;
import com.skapp.community.timeplanner.payload.request.ManagerTimeRequestFilterDto;
import com.skapp.community.timeplanner.repository.TimeRequestRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.query.QueryUtils;
import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Repository
public class TimeRequestRepositoryImpl implements TimeRequestRepository {

	private final EntityManager entityManager;

	@Override
	public Page<TimeRequest> findAllTimeRequestsOnDateByFilters(Employee currentEmployee,
			EmployeeTimeRequestFilterDto employeeTimeRequestFilterDto, Pageable pageable) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<TimeRequest> criteriaQuery = criteriaBuilder.createQuery(TimeRequest.class);
		Root<TimeRequest> timeRequestRoot = criteriaQuery.from(TimeRequest.class);
		Join<TimeRequest, Employee> employeeJoin = timeRequestRoot.join(TimeRequest_.employee);
		Join<Employee, User> userJoin = employeeJoin.join(Employee_.user);

		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder.equal(userJoin.get(User_.isActive), Boolean.TRUE));
		predicates.add(criteriaBuilder.equal(timeRequestRoot.get(TimeRecord_.EMPLOYEE), currentEmployee));

		if (employeeTimeRequestFilterDto.getStartTime() != null && employeeTimeRequestFilterDto.getEndTime() != null) {
			predicates.add(criteriaBuilder.between(timeRequestRoot.get(TimeRequest_.REQUESTED_START_TIME),
					employeeTimeRequestFilterDto.getStartTime(), employeeTimeRequestFilterDto.getEndTime()));
		}

		if (employeeTimeRequestFilterDto.getStatus() != null && !employeeTimeRequestFilterDto.getStatus().isEmpty()) {
			CriteriaBuilder.In<RequestStatus> requestStatusIn = criteriaBuilder
				.in(timeRequestRoot.get(TimeRequest_.STATUS));
			employeeTimeRequestFilterDto.getStatus().forEach(requestStatusIn::value);
			predicates.add(requestStatusIn);
		}

		if (employeeTimeRequestFilterDto.getRequestType() != null)
			predicates.add(criteriaBuilder.equal(timeRequestRoot.get(TimeRequest_.REQUEST_TYPE),
					employeeTimeRequestFilterDto.getRequestType()));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery.orderBy(QueryUtils.toOrders(pageable.getSort(), timeRequestRoot, criteriaBuilder));

		TypedQuery<TimeRequest> query = entityManager.createQuery(criteriaQuery);
		int totalRows = query.getResultList().size();

		query.setFirstResult(pageable.getPageNumber() * pageable.getPageSize());
		query.setMaxResults(pageable.getPageSize());
		return new PageImpl<>(query.getResultList(), pageable, totalRows);
	}

	@Override
	public List<TimeRequest> findTimeRequestsByOptionalFilters(EmployeeTimeRequestFilterDto filterDto) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<TimeRequest> criteriaQuery = criteriaBuilder.createQuery(TimeRequest.class);
		Root<TimeRequest> timeRequestRoot = criteriaQuery.from(TimeRequest.class);
		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder.equal(timeRequestRoot.get(TimeRequest_.EMPLOYEE).get(Employee_.EMPLOYEE_ID),
				filterDto.getEmployeeId()));

		for (RequestStatus status : filterDto.getStatus()) {
			predicates.add(criteriaBuilder.equal(timeRequestRoot.get(TimeRequest_.STATUS), status));
		}
		predicates.addAll(joinTimeRecordTable(filterDto, timeRequestRoot, criteriaBuilder));

		if (filterDto.getRecordId() != null)
			predicates.add(
					criteriaBuilder.equal(timeRequestRoot.get(TimeRequest_.TIME_RECORD).get(TimeRecord_.TIME_RECORD_ID),
							filterDto.getRecordId()));

		if (filterDto.getRequestType() != null)
			predicates
				.add(criteriaBuilder.equal(timeRequestRoot.get(TimeRequest_.REQUEST_TYPE), filterDto.getRequestType()));

		if (filterDto.getStartTime() != null && filterDto.getEndTime() != null) {
			predicates.add(criteriaBuilder.or(
					criteriaBuilder.between(timeRequestRoot.get(TimeRequest_.REQUESTED_START_TIME),
							filterDto.getStartTime(), filterDto.getEndTime()),
					criteriaBuilder.between(timeRequestRoot.get(TimeRequest_.REQUESTED_END_TIME),
							filterDto.getStartTime(), filterDto.getEndTime()),
					criteriaBuilder.equal(timeRequestRoot.get(TimeRequest_.REQUESTED_START_TIME),
							filterDto.getStartTime()),
					criteriaBuilder.equal(timeRequestRoot.get(TimeRequest_.REQUESTED_END_TIME),
							filterDto.getEndTime())));
		}
		else {
			if (filterDto.getStartTime() != null)
				predicates.add(criteriaBuilder.or(criteriaBuilder
					.equal(timeRequestRoot.get(TimeRequest_.REQUESTED_START_TIME), filterDto.getStartTime())));
			if (filterDto.getEndTime() != null)
				predicates.add(criteriaBuilder.or(criteriaBuilder
					.equal(timeRequestRoot.get(TimeRequest_.REQUESTED_END_TIME), filterDto.getEndTime())));
		}

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		TypedQuery<TimeRequest> query = entityManager.createQuery(criteriaQuery);
		return query.getResultList();
	}

	@Override
	public List<TimeRequest> findPendingEntryRequestsWithoutTimeRecordId(Long employeeId, Long startTime,
			Long endTime) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<TimeRequest> criteriaQuery = criteriaBuilder.createQuery(TimeRequest.class);
		Root<TimeRequest> timeRequestRoot = criteriaQuery.from(TimeRequest.class);
		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder.equal(timeRequestRoot.get(TimeRequest_.STATUS), RequestStatus.PENDING));
		predicates.add(criteriaBuilder.equal(timeRequestRoot.get(TimeRequest_.REQUEST_TYPE),
				RequestType.MANUAL_ENTRY_REQUEST));
		predicates.add(criteriaBuilder.equal(timeRequestRoot.get(TimeRequest_.EMPLOYEE).get(Employee_.EMPLOYEE_ID),
				employeeId));

		predicates.add(criteriaBuilder.or(criteriaBuilder.and(
				criteriaBuilder.lessThanOrEqualTo(timeRequestRoot.get(TimeRequest_.REQUESTED_START_TIME), startTime),
				criteriaBuilder.greaterThanOrEqualTo(timeRequestRoot.get(TimeRequest_.REQUESTED_END_TIME), startTime)),
				criteriaBuilder.and(
						criteriaBuilder.lessThanOrEqualTo(timeRequestRoot.get(TimeRequest_.REQUESTED_START_TIME),
								endTime),
						criteriaBuilder.greaterThanOrEqualTo(timeRequestRoot.get(TimeRequest_.REQUESTED_END_TIME),
								endTime)),
				criteriaBuilder.between(timeRequestRoot.get(TimeRequest_.REQUESTED_START_TIME), startTime, endTime),
				criteriaBuilder.between(timeRequestRoot.get(TimeRequest_.REQUESTED_END_TIME), startTime, endTime)));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		TypedQuery<TimeRequest> query = entityManager.createQuery(criteriaQuery);
		return query.getResultList();
	}

	@Override
	public Page<TimeRequest> findAllAssignEmployeesTimeRequests(Long userId,
			ManagerTimeRequestFilterDto timeRequestFilterDto, Pageable pageable) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<TimeRequest> criteriaQuery = criteriaBuilder.createQuery(TimeRequest.class);
		Root<TimeRequest> timeRequestRoot = criteriaQuery.from(TimeRequest.class);
		List<Predicate> predicates = new ArrayList<>();

		Join<TimeRequest, Employee> employee = timeRequestRoot.join(TimeRequest_.employee);
		Join<Employee, EmployeeManager> managers = employee.join(Employee_.employeeManagers);
		Join<EmployeeManager, Employee> manEmp = managers.join(EmployeeManager_.manager);
		Join<Employee, User> user = employee.join(Employee_.user);

		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		predicates.add(criteriaBuilder.equal(manEmp.get(Employee_.employeeId), userId));

		if (!CollectionUtils.isEmpty(timeRequestFilterDto.getStatus())) {
			predicates.add(timeRequestRoot.get(TimeRequest_.status).in(timeRequestFilterDto.getStatus()));
		}

		predicates.add(criteriaBuilder.between(timeRequestRoot.get(TimeRequest_.REQUESTED_START_TIME),
				DateTimeUtils.getLongValueOfDate(timeRequestFilterDto.getStartDate()) * 1000,
				DateTimeUtils.getLongValueOfDate(timeRequestFilterDto.getEndDate()) * 1000));

		Predicate[] predicateArray = new Predicate[predicates.size()];
		predicates.toArray(predicateArray);
		criteriaQuery.where(predicateArray);
		criteriaQuery.select(timeRequestRoot).distinct(true);
		criteriaQuery.orderBy(QueryUtils.toOrders(pageable.getSort(), timeRequestRoot, criteriaBuilder));

		TypedQuery<TimeRequest> query = entityManager.createQuery(criteriaQuery);

		int totalRows = query.getResultList().size();
		query.setFirstResult(pageable.getPageNumber() * pageable.getPageSize());
		query.setMaxResults(pageable.getPageSize());

		return new PageImpl<>(query.getResultList(), pageable, totalRows);
	}

	@Override
	public Long countSupervisedPendingTimeRequests(Long userId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> criteriaQuery = criteriaBuilder.createQuery(Long.class);
		Root<TimeRequest> timeRequestRoot = criteriaQuery.from(TimeRequest.class);

		Join<TimeRequest, Employee> employee = timeRequestRoot.join(TimeRequest_.employee);
		Join<Employee, EmployeeManager> managers = employee.join(Employee_.employeeManagers);
		Join<EmployeeManager, Employee> managerEmployee = managers.join(EmployeeManager_.manager);
		Join<Employee, User> user = employee.join(Employee_.user);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		predicates.add(criteriaBuilder.equal(managerEmployee.get(Employee_.employeeId), userId));
		predicates.add(criteriaBuilder.equal(timeRequestRoot.get(TimeRequest_.status), RequestStatus.PENDING));

		Predicate[] predicateArray = new Predicate[predicates.size()];
		predicates.toArray(predicateArray);

		criteriaQuery.select(criteriaBuilder.count(timeRequestRoot)).where(predicateArray).distinct(true);

		return entityManager.createQuery(criteriaQuery).getSingleResult();
	}

	private List<Predicate> joinTimeRecordTable(EmployeeTimeRequestFilterDto filterDto,
			Root<TimeRequest> timeRequestRoot, CriteriaBuilder criteriaBuilder) {
		List<Predicate> predicates = new ArrayList<>();
		if (filterDto.getEmployeeId() != null || filterDto.getDate() != null) {
			Join<TimeRequest, TimeRecord> timeRecordJoin = timeRequestRoot.join(TimeRequest_.timeRecord);
			if (filterDto.getEmployeeId() != null)
				predicates
					.add(criteriaBuilder.equal(timeRecordJoin.get(TimeRecord_.EMPLOYEE).get(Employee_.EMPLOYEE_ID),
							filterDto.getEmployeeId()));

			if (filterDto.getDate() != null)
				predicates.add(criteriaBuilder.equal(timeRecordJoin.get(TimeRecord_.DATE), filterDto.getDate()));
		}
		return predicates;
	}

}
