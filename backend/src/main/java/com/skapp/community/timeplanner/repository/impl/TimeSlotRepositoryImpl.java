package com.skapp.community.timeplanner.repository.impl;

import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.model.TimeRecord_;
import com.skapp.community.timeplanner.model.TimeSlot;
import com.skapp.community.timeplanner.model.TimeSlot_;
import com.skapp.community.timeplanner.payload.request.TimeSlotFilterDto;
import com.skapp.community.timeplanner.repository.TimeSlotRepository;
import com.skapp.community.timeplanner.type.SlotType;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class TimeSlotRepositoryImpl implements TimeSlotRepository {

	private final EntityManager entityManager;

	@Override
	public Page<TimeSlot> getTimeSlotsByTimePeriod(TimeSlotFilterDto filterDto) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<TimeSlot> criteriaQuery = criteriaBuilder.createQuery(TimeSlot.class);
		Root<TimeSlot> timeSlotRoot = criteriaQuery.from(TimeSlot.class);
		List<Predicate> predicates = new ArrayList<>();

		if (filterDto.getDate() != null || filterDto.getEmployeeId() != null) {
			Join<TimeSlot, TimeRecord> timeRecordJoin = timeSlotRoot.join(TimeSlot_.TIME_RECORD);
			if (filterDto.getEmployeeId() != null)
				predicates
					.add(criteriaBuilder.equal(timeRecordJoin.get(TimeRecord_.EMPLOYEE).get(Employee_.EMPLOYEE_ID),
							filterDto.getEmployeeId()));

			if (filterDto.getDate() != null)
				predicates.add(criteriaBuilder.equal(timeRecordJoin.get(TimeRecord_.DATE), filterDto.getDate()));
		}

		if (filterDto.getRecordId() != null)
			predicates.add(criteriaBuilder.equal(
					timeSlotRoot.get(TimeSlot_.TIME_RECORD).get(TimeRecord_.TIME_RECORD_ID), filterDto.getRecordId()));

		if (filterDto.getStartTime() != null && filterDto.getEndTime() != null) {
			predicates.add(criteriaBuilder.and(
					criteriaBuilder.lessThanOrEqualTo(timeSlotRoot.get(TimeSlot_.START_TIME), filterDto.getStartTime()),
					criteriaBuilder.greaterThanOrEqualTo(timeSlotRoot.get(TimeSlot_.END_TIME),
							filterDto.getEndTime())));
		}

		if (filterDto.getSlotType() != null && !filterDto.getSlotType().isEmpty()) {
			CriteriaBuilder.In<SlotType> slotInClause = criteriaBuilder.in(timeSlotRoot.get(TimeSlot_.SLOT_TYPE));
			filterDto.getSlotType().forEach(slotInClause::value);
			predicates.add(slotInClause);
		}

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		TypedQuery<TimeSlot> query = entityManager.createQuery(criteriaQuery);

		int totalRows = query.getResultList().size();

		PageRequest page = Boolean.TRUE.equals(filterDto.getIsExport())
				? PageRequest.of(0, Integer.MAX_VALUE,
						Sort.by(filterDto.getSortBy(), filterDto.getSortKey().toString()))
				: PageRequest.of(filterDto.getPageNumber(), filterDto.getPageSize(),
						Sort.by(filterDto.getSortBy(), filterDto.getSortKey().toString()));

		query.setFirstResult(page.getPageNumber() * page.getPageSize());
		query.setMaxResults(page.getPageSize());

		return new PageImpl<>(query.getResultList(), page, totalRows);
	}

	@Override
	public List<TimeSlot> getFullyAndPartiallyOverlappingSlots(Long recordId, Long startTime, Long endTime) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<TimeSlot> criteriaQuery = criteriaBuilder.createQuery(TimeSlot.class);
		Root<TimeSlot> rootTimeSlot = criteriaQuery.from(TimeSlot.class);
		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder.equal(rootTimeSlot.get(TimeSlot_.TIME_RECORD).get(TimeRecord_.TIME_RECORD_ID),
				recordId));
		predicates.add(criteriaBuilder.or(
				criteriaBuilder.and(criteriaBuilder.between(rootTimeSlot.get(TimeSlot_.START_TIME), startTime, endTime),
						criteriaBuilder.between(rootTimeSlot.get(TimeSlot_.END_TIME), startTime, endTime)),
				criteriaBuilder.and(criteriaBuilder.lessThan(rootTimeSlot.get(TimeSlot_.START_TIME), startTime),
						criteriaBuilder.greaterThan(rootTimeSlot.get(TimeSlot_.END_TIME), startTime)),
				criteriaBuilder.and(criteriaBuilder.lessThan(rootTimeSlot.get(TimeSlot_.START_TIME), endTime),
						criteriaBuilder.greaterThan(rootTimeSlot.get(TimeSlot_.END_TIME), endTime))));
		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray).orderBy(criteriaBuilder.asc(rootTimeSlot.get(TimeSlot_.START_TIME)));

		TypedQuery<TimeSlot> query = entityManager.createQuery(criteriaQuery);
		return query.getResultList();
	}

	@Override
	public List<TimeSlot> getNotFullyOverlappingSlots(Long recordId, Long startTime, Long endTime) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<TimeSlot> criteriaQuery = criteriaBuilder.createQuery(TimeSlot.class);
		Root<TimeSlot> rootTimeSlot = criteriaQuery.from(TimeSlot.class);
		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder.equal(rootTimeSlot.get(TimeSlot_.TIME_RECORD).get(TimeRecord_.TIME_RECORD_ID),
				recordId));
		predicates.add(criteriaBuilder.or(
				criteriaBuilder.not(criteriaBuilder.and(
						criteriaBuilder.between(rootTimeSlot.get(TimeSlot_.START_TIME), startTime, endTime),
						criteriaBuilder.between(rootTimeSlot.get(TimeSlot_.END_TIME), startTime, endTime))),
				criteriaBuilder.and(criteriaBuilder.lessThan(rootTimeSlot.get(TimeSlot_.START_TIME), startTime),
						criteriaBuilder.greaterThan(rootTimeSlot.get(TimeSlot_.END_TIME), startTime)),
				criteriaBuilder.and(criteriaBuilder.lessThan(rootTimeSlot.get(TimeSlot_.START_TIME), endTime),
						criteriaBuilder.greaterThan(rootTimeSlot.get(TimeSlot_.END_TIME), endTime))));
		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray).orderBy(criteriaBuilder.asc(rootTimeSlot.get(TimeSlot_.START_TIME)));

		TypedQuery<TimeSlot> query = entityManager.createQuery(criteriaQuery);
		return query.getResultList();
	}

}
