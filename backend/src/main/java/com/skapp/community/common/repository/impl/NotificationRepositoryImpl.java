package com.skapp.community.common.repository.impl;

import com.skapp.community.common.model.Notification;
import com.skapp.community.common.model.Notification_;
import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.payload.request.NotificationsFilterDto;
import com.skapp.community.common.payload.response.NotificationTypeCountResponseDto;
import com.skapp.community.common.repository.NotificationRepository;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
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

import java.util.ArrayList;
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

		Predicate[] predicatesArray = new Predicate[predicates.size()];
		predicates.toArray(predicatesArray);

		criteriaQuery.select(criteriaBuilder.construct(NotificationTypeCountResponseDto.class,
				root.get(Notification_.NOTIFICATION_TYPE), criteriaBuilder.count(root)));
		criteriaQuery.where(predicatesArray);
		criteriaQuery.groupBy(root.get(Notification_.NOTIFICATION_TYPE));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

}
