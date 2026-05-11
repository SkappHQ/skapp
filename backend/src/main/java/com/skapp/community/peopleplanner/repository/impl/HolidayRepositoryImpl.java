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
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
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

	public Page<Holiday> findAllHolidays(HolidayFilterDto holidayFilterDto, Pageable page) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Holiday> criteriaQuery = criteriaBuilder.createQuery(Holiday.class);
		Root<Holiday> root = criteriaQuery.from(Holiday.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(root.get(Holiday_.isActive), true));

		if (holidayFilterDto != null) {
			if (!CollectionUtils.isEmpty(holidayFilterDto.getHolidayDurations())) {
				predicates.add(root.get(Holiday_.holidayDuration).in(holidayFilterDto.getHolidayDurations()));
			}
			Integer year = holidayFilterDto.getYear();
			LocalDate date = holidayFilterDto.getDate();
			Predicate dateBetween;
			if (year != null) {
				dateBetween = criteriaBuilder.between(root.get(Holiday_.date),
						DateTimeUtils.getUtcLocalDate(year, 1, 1), DateTimeUtils.getUtcLocalDate(year, 12, 31));
			}
			else if (date != null) {
				dateBetween = criteriaBuilder.between(root.get(Holiday_.date), date, date);
			}
			else {
				dateBetween = criteriaBuilder.between(root.get(Holiday_.date),
						DateTimeUtils.getUtcLocalDate(DateTimeUtils.getCurrentYear(), 1, 1),
						DateTimeUtils.getUtcLocalDate(DateTimeUtils.getCurrentYear(), 12, 31));
			}
			predicates.add(dateBetween);

			String workLocation = holidayFilterDto.getWorkLocation();
			if (workLocation != null && !workLocation.trim().isEmpty()
					&& !PeopleConstants.HOLIDAY_ALL_WORK_LOCATIONS.equalsIgnoreCase(workLocation.trim())) {

				Subquery<Long> workLocationExistsSubquery = criteriaQuery.subquery(Long.class);
				Root<Holiday> subRoot = workLocationExistsSubquery.from(Holiday.class);
				subRoot.join(Holiday_.workLocations);
				workLocationExistsSubquery.select(criteriaBuilder.literal(1L))
					.where(criteriaBuilder.equal(subRoot.get(Holiday_.id), root.get(Holiday_.id)));

				Join<Holiday, WorkLocation> workLocationJoin = root.join(Holiday_.workLocations, JoinType.LEFT);
				predicates.add(criteriaBuilder.or(
						criteriaBuilder.equal(criteriaBuilder.lower(workLocationJoin.get(WorkLocation_.name)),
								workLocation.trim().toLowerCase()),
						criteriaBuilder.not(criteriaBuilder.exists(workLocationExistsSubquery))));
				criteriaQuery.distinct(true);
			}
		}

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery.orderBy(QueryUtils.toOrders(page.getSort(), root, criteriaBuilder));

		TypedQuery<Holiday> query = entityManager.createQuery(criteriaQuery);

		int totalRows = query.getResultList().size();
		query.setFirstResult(page.getPageNumber() * page.getPageSize());
		query.setMaxResults(page.getPageSize());

		return new PageImpl<>(query.getResultList(), page, totalRows);
	}

}
