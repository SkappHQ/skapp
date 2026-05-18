package com.skapp.community.peopleplanner.repository.impl;

import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.model.WorkLocation_;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.peopleplanner.constant.PeopleConstants;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.model.Holiday_;
import com.skapp.community.peopleplanner.payload.request.HolidayFilterDto;
import com.skapp.community.peopleplanner.repository.HolidayRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.query.QueryUtils;
import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class HolidayRepositoryImpl implements HolidayRepository {

	private final EntityManager entityManager;

	@Override
	public Page<Holiday> findAllHolidays(HolidayFilterDto holidayFilterDto, Pageable page) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
		Root<Holiday> countRoot = countQuery.from(Holiday.class);
		List<Predicate> countPredicates = buildPredicates(criteriaBuilder, countQuery, holidayFilterDto, countRoot);
		countQuery.select(criteriaBuilder.count(countRoot));
		countQuery.where(countPredicates.toArray(new Predicate[0]));
		long totalRows = entityManager.createQuery(countQuery).getSingleResult();

		if (totalRows == 0) {
			return new PageImpl<>(List.of(), page, 0);
		}

		CriteriaQuery<Holiday> criteriaQuery = criteriaBuilder.createQuery(Holiday.class);
		Root<Holiday> root = criteriaQuery.from(Holiday.class);
		root.fetch(Holiday_.workLocations, JoinType.LEFT);
		List<Predicate> dataPredicates = buildPredicates(criteriaBuilder, criteriaQuery, holidayFilterDto, root);
		criteriaQuery.where(dataPredicates.toArray(new Predicate[0]));
		criteriaQuery.distinct(true);
		criteriaQuery.orderBy(QueryUtils.toOrders(page.getSort(), root, criteriaBuilder));

		TypedQuery<Holiday> query = entityManager.createQuery(criteriaQuery);
		query.setFirstResult((int) page.getOffset());
		query.setMaxResults(page.getPageSize());

		return new PageImpl<>(query.getResultList(), page, totalRows);
	}

	@Override
	public List<Holiday> findAllActiveHolidaysByDateWithWorkLocations(LocalDate date) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Holiday> criteriaQuery = criteriaBuilder.createQuery(Holiday.class);
		Root<Holiday> root = criteriaQuery.from(Holiday.class);
		root.fetch(Holiday_.workLocations, JoinType.LEFT);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(root.get(Holiday_.isActive), true));
		predicates.add(criteriaBuilder.equal(root.get(Holiday_.date), date));

		criteriaQuery.where(predicates.toArray(new Predicate[0]));
		criteriaQuery.distinct(true);

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public List<Holiday> findAllActiveHolidaysByWorkLocationId(Long workLocationId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Holiday> criteriaQuery = criteriaBuilder.createQuery(Holiday.class);
		Root<Holiday> root = criteriaQuery.from(Holiday.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(root.get(Holiday_.isActive), true));

		Join<Holiday, WorkLocation> workLocationJoin = root.join(Holiday_.workLocations, JoinType.LEFT);
		predicates.add(criteriaBuilder.or(
				criteriaBuilder.equal(workLocationJoin.get(WorkLocation_.workLocationId), workLocationId),
				criteriaBuilder.isEmpty(root.get(Holiday_.workLocations))));

		criteriaQuery.where(predicates.toArray(new Predicate[0]));
		criteriaQuery.distinct(true);

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	private static List<Predicate> buildPredicates(CriteriaBuilder criteriaBuilder, CriteriaQuery<?> criteriaQuery,
			HolidayFilterDto holidayFilterDto, Root<Holiday> root) {

		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder.equal(root.get(Holiday_.isActive), true));

		if (holidayFilterDto != null) {
			if (!CollectionUtils.isEmpty(holidayFilterDto.getHolidayDurations())) {
				predicates.add(root.get(Holiday_.holidayDuration).in(holidayFilterDto.getHolidayDurations()));
			}
			Integer year = holidayFilterDto.getYear();
			LocalDate date = holidayFilterDto.getDate();
			Predicate datePredicate;
			if (year != null) {
				datePredicate = criteriaBuilder.between(root.get(Holiday_.date),
						DateTimeUtils.getUtcLocalDate(year, 1, 1), DateTimeUtils.getUtcLocalDate(year, 12, 31));
			}
			else if (date != null) {
				datePredicate = criteriaBuilder.equal(root.get(Holiday_.date), date);
			}
			else {
				datePredicate = criteriaBuilder.between(root.get(Holiday_.date),
						DateTimeUtils.getUtcLocalDate(DateTimeUtils.getCurrentYear(), 1, 1),
						DateTimeUtils.getUtcLocalDate(DateTimeUtils.getCurrentYear(), 12, 31));
			}
			predicates.add(datePredicate);

			Long workLocationId = holidayFilterDto.getWorkLocationId();
			if (workLocationId != null && !workLocationId.equals(PeopleConstants.HOLIDAY_ALL_WORK_LOCATIONS_ID)) {
				Join<Holiday, WorkLocation> workLocationJoin = root.join(Holiday_.workLocations, JoinType.LEFT);
				predicates.add(criteriaBuilder.or(
						criteriaBuilder.equal(workLocationJoin.get(WorkLocation_.workLocationId), workLocationId),
						criteriaBuilder.isEmpty(root.get(Holiday_.workLocations))));
				criteriaQuery.distinct(true);
			}
		}

		return predicates;
	}

}
