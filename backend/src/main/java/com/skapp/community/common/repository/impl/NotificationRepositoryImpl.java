package com.skapp.community.common.repository.impl;

import com.skapp.community.common.model.Notification;
import com.skapp.community.common.model.Notification_;
import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.payload.request.NotificationsFilterDto;
import com.skapp.community.common.payload.response.NotificationTypeCountResponseDto;
import com.skapp.community.common.repository.NotificationRepository;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.model.LeaveRequest_;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.timeplanner.model.TimeRequest;
import com.skapp.community.timeplanner.model.TimeRequest_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.CriteriaUpdate;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import com.skapp.community.common.type.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.query.QueryUtils;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class NotificationRepositoryImpl implements NotificationRepository {

	private final EntityManager entityManager;

	@Override
	public Page<Notification> findAllByUserIDAndNotificationFilterDto(Long userId,
			NotificationsFilterDto notificationsFilterDto, Pageable page) {
		var criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Notification> criteriaQuery = criteriaBuilder.createQuery(Notification.class);
		Root<Notification> root = criteriaQuery.from(Notification.class);

		Join<Notification, Employee> notificationEmployeeJoin = root.join(Notification_.EMPLOYEE);
		Join<Employee, User> userJoin = notificationEmployeeJoin.join(Employee_.user);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(userJoin.get(User_.isActive), Boolean.TRUE));
		predicates.add(criteriaBuilder.equal(userJoin.get(User_.USER_ID), userId));

		if (notificationsFilterDto.getIsViewed() != null) {
			predicates
				.add(criteriaBuilder.equal(root.get(Notification_.IS_VIEWED), notificationsFilterDto.getIsViewed()));
		}

		Predicate[] predicatesArray = new Predicate[predicates.size()];
		predicates.toArray(predicatesArray);
		criteriaQuery.where(predicatesArray);
		criteriaQuery.orderBy(QueryUtils.toOrders(page.getSort(), root, criteriaBuilder));

		TypedQuery<Notification> query = entityManager.createQuery(criteriaQuery);
		int totalRows = query.getResultList().size();
		query.setFirstResult(page.getPageNumber() * page.getPageSize());
		query.setMaxResults(page.getPageSize());

		return new PageImpl<>(query.getResultList(), page, totalRows);
	}

	@Override
	public long countUnreadNotificationsByUserId(Long userId) {
		var criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Long> criteriaQuery = criteriaBuilder.createQuery(Long.class);
		Root<Notification> root = criteriaQuery.from(Notification.class);

		Join<Notification, Employee> notificationEmployeeJoin = root.join(Notification_.EMPLOYEE);
		Join<Employee, User> userJoin = notificationEmployeeJoin.join(Employee_.USER);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(userJoin.get(User_.IS_ACTIVE), Boolean.TRUE));
		predicates.add(criteriaBuilder.equal(userJoin.get(User_.USER_ID), userId));
		predicates.add(criteriaBuilder.equal(root.get(Notification_.IS_VIEWED), Boolean.FALSE));

		Predicate[] predicatesArray = new Predicate[predicates.size()];
		predicates.toArray(predicatesArray);

		criteriaQuery.select(criteriaBuilder.count(root));
		criteriaQuery.where(predicatesArray);

		return entityManager.createQuery(criteriaQuery).getSingleResult();
	}

	@Override
	public List<NotificationTypeCountResponseDto> countNotificationsByTypeForUser(Long userId) {
		var criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<NotificationTypeCountResponseDto> criteriaQuery = criteriaBuilder
			.createQuery(NotificationTypeCountResponseDto.class);
		Root<Notification> root = criteriaQuery.from(Notification.class);

		Join<Notification, Employee> notificationEmployeeJoin = root.join(Notification_.EMPLOYEE);
		Join<Employee, User> userJoin = notificationEmployeeJoin.join(Employee_.USER);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(userJoin.get(User_.IS_ACTIVE), Boolean.TRUE));
		predicates.add(criteriaBuilder.equal(userJoin.get(User_.USER_ID), userId));
		predicates.add(criteriaBuilder.equal(root.get(Notification_.IS_TYPE_VIEWED), Boolean.FALSE));

		Subquery<Long> ownLeaveExistsSubquery = criteriaQuery.subquery(Long.class);
		Root<LeaveRequest> leaveRequestRoot = ownLeaveExistsSubquery.from(LeaveRequest.class);
		ownLeaveExistsSubquery.select(leaveRequestRoot.get(LeaveRequest_.leaveRequestId));
		ownLeaveExistsSubquery.where(
				criteriaBuilder.equal(leaveRequestRoot.get(LeaveRequest_.leaveRequestId).as(String.class),
						root.get(Notification_.resourceId)),
				criteriaBuilder.equal(leaveRequestRoot.get(LeaveRequest_.employee).get(Employee_.employeeId),
						notificationEmployeeJoin.get(Employee_.employeeId)));

		Predicate notOwnLeaveRequest = criteriaBuilder.not(criteriaBuilder.and(
				root.get(Notification_.notificationType)
					.in(NotificationType.LEAVE_REQUEST, NotificationType.LEAVE_REQUEST_NUDGE),
				criteriaBuilder.exists(ownLeaveExistsSubquery)));

		Subquery<Long> ownTimeExistsSubquery = criteriaQuery.subquery(Long.class);
		Root<TimeRequest> timeRequestRoot = ownTimeExistsSubquery.from(TimeRequest.class);
		ownTimeExistsSubquery.select(timeRequestRoot.get(TimeRequest_.timeRequestId));
		ownTimeExistsSubquery.where(
				criteriaBuilder.equal(timeRequestRoot.get(TimeRequest_.timeRequestId).as(String.class),
						root.get(Notification_.resourceId)),
				criteriaBuilder.equal(timeRequestRoot.get(TimeRequest_.employee).get(Employee_.employeeId),
						notificationEmployeeJoin.get(Employee_.employeeId)));

		Predicate notOwnTimeEntry = criteriaBuilder.not(criteriaBuilder.and(
				criteriaBuilder.equal(root.get(Notification_.notificationType), NotificationType.TIME_ENTRY),
				criteriaBuilder.exists(ownTimeExistsSubquery)));

		predicates.add(notOwnLeaveRequest);
		predicates.add(notOwnTimeEntry);

		Predicate[] predicatesArray = new Predicate[predicates.size()];
		predicates.toArray(predicatesArray);

		criteriaQuery.select(criteriaBuilder.construct(NotificationTypeCountResponseDto.class,
				root.get(Notification_.notificationType), criteriaBuilder.count(root)));
		criteriaQuery.where(predicatesArray);
		criteriaQuery.groupBy(root.get(Notification_.notificationType));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public int markTypeViewedByUserIdAndTypes(Long userId, Collection<NotificationType> types) {
		var criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaUpdate<Notification> update = criteriaBuilder.createCriteriaUpdate(Notification.class);
		Root<Notification> root = update.from(Notification.class);

		Join<Notification, Employee> employeeJoin = root.join(Notification_.EMPLOYEE);
		Join<Employee, User> userJoin = employeeJoin.join(Employee_.USER);

		update.set(root.get(Notification_.IS_TYPE_VIEWED), Boolean.TRUE);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(userJoin.get(User_.USER_ID), userId));
		predicates.add(root.get(Notification_.notificationType).in(types));
		predicates.add(criteriaBuilder.equal(root.get(Notification_.IS_TYPE_VIEWED), Boolean.FALSE));

		Predicate[] predicatesArray = new Predicate[predicates.size()];
		predicates.toArray(predicatesArray);
		update.where(predicatesArray);

		return entityManager.createQuery(update).executeUpdate();
	}

}
