package com.skapp.enterprise.esignature.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.AddressBook_;
import com.skapp.enterprise.esignature.model.ExternalUser;
import com.skapp.enterprise.esignature.model.ExternalUser_;
import com.skapp.enterprise.esignature.payload.request.AddressBookFilterDto;
import com.skapp.enterprise.esignature.repository.AddressBookRepository;
import com.skapp.enterprise.esignature.repository.projection.AddressBookUserData;
import com.skapp.enterprise.esignature.type.UserType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class AddressBookRepositoryImpl implements AddressBookRepository {

	private final EntityManager entityManager;

	@Override
	@Transactional
	public PageDto fetchAddressBookWithPaginationAndSorting(AddressBookFilterDto addressBookFilterDto) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<AddressBookUserData> query = cb.createQuery(AddressBookUserData.class);
		Root<AddressBook> addressBookRoot = query.from(AddressBook.class);

		Join<AddressBook, User> internalUserJoin = addressBookRoot.join(AddressBook_.INTERNAL_USER, JoinType.LEFT);
		Join<AddressBook, ExternalUser> externalUserJoin = addressBookRoot.join(AddressBook_.EXTERNAL_USER,
				JoinType.LEFT);
		Join<User, Employee> employeeJoin = internalUserJoin.join(User_.EMPLOYEE, JoinType.LEFT);

		AddressBookUserView user = getAddressBookUserView(cb, internalUserJoin, employeeJoin, externalUserJoin);

		query.select(cb.construct(AddressBookUserData.class, addressBookRoot.get("id"), user.userId(), user.email(),
				user.userType(), user.firstName(), user.lastName(), user.authPic(), user.phone()));

		List<Predicate> predicates = new ArrayList<>();

		predicates.add(cb.isTrue(addressBookRoot.get(AddressBook_.IS_ACTIVE)));

		List<UserType> userTypes = addressBookFilterDto.getUserType();

		if (userTypes != null && userTypes.size() == 1) {
			predicates.add(cb.equal(addressBookRoot.get(AddressBook_.TYPE), userTypes.getFirst()));
		}

		String keyword = addressBookFilterDto.getSearchKeyword();
		if (keyword != null && !keyword.trim().isEmpty()) {
			Predicate firstNameLike = cb.like(cb.lower(user.firstName().as(String.class)), keyword.toLowerCase() + "%");
			Predicate lastNameLike = cb.like(cb.lower(user.lastName().as(String.class)), keyword.toLowerCase() + "%");
			Predicate emailLike = cb.like(cb.lower(user.email().as(String.class)), keyword.toLowerCase() + "%");

			Predicate searchPredicate = cb.or(firstNameLike, lastNameLike, emailLike);
			predicates.add(searchPredicate);

			Order sortingOrder = cb.asc(cb.selectCase()
				.when(cb.like(cb.lower(user.firstName().as(String.class)), keyword.toLowerCase() + "%"), 1)
				.when(cb.like(cb.lower(user.lastName().as(String.class)), keyword.toLowerCase() + "%"), 2)
				.when(cb.like(cb.lower(user.email().as(String.class)), keyword.toLowerCase() + "%"), 3)
				.otherwise(4));
			query.orderBy(sortingOrder);
		}
		else {
			if (addressBookFilterDto.getSortOrder().isAscending()) {
				query.orderBy(cb.asc(user.firstName()), cb.asc(user.lastName()));
			}
			else {
				query.orderBy(cb.desc(user.firstName()), cb.desc(user.lastName()));
			}
		}

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		query.where(predArray);

		int page = addressBookFilterDto.getPage();
		int size = addressBookFilterDto.getSize();

		TypedQuery<AddressBookUserData> typedQuery = entityManager.createQuery(query);
		long totalItems = typedQuery.getResultList().size();
		typedQuery.setFirstResult(page * size);
		typedQuery.setMaxResults(size);

		int totalPages = (int) Math.ceil((double) totalItems / size);

		PageDto pageDto = new PageDto();

		pageDto.setTotalItems(totalItems);
		pageDto.setCurrentPage(page);
		pageDto.setTotalPages(totalPages);
		pageDto.setItems(typedQuery.getResultList());

		return pageDto;
	}

	@Override
	public List<AddressBookUserData> fetchAddressBookContactsByEmailPriority(String keyword) {
		if (keyword != null && !keyword.trim().isEmpty()) {
			CriteriaBuilder cb = entityManager.getCriteriaBuilder();
			CriteriaQuery<AddressBookUserData> query = cb.createQuery(AddressBookUserData.class);
			Root<AddressBook> addressBookRoot = query.from(AddressBook.class);

			Join<AddressBook, User> internalUserJoin = addressBookRoot.join(AddressBook_.INTERNAL_USER, JoinType.LEFT);
			Join<AddressBook, ExternalUser> externalUserJoin = addressBookRoot.join(AddressBook_.EXTERNAL_USER,
					JoinType.LEFT);
			Join<User, Employee> employeeJoin = internalUserJoin.join(User_.EMPLOYEE, JoinType.LEFT);

			AddressBookUserView user = getAddressBookUserView(cb, internalUserJoin, employeeJoin, externalUserJoin);

			query.select(cb.construct(AddressBookUserData.class, addressBookRoot.get("id"), user.userId(), user.email(),
					user.userType(), user.firstName(), user.lastName(), user.authPic(), user.phone()));

			Predicate isActivePredicate = cb.isTrue(addressBookRoot.get(AddressBook_.IS_ACTIVE));

			Predicate emailLike = cb.like(cb.lower(user.email().as(String.class)), keyword.toLowerCase() + "%");
			Predicate firstNameLike = cb.like(cb.lower(user.firstName().as(String.class)), keyword.toLowerCase() + "%");
			Predicate lastNameLike = cb.like(cb.lower(user.lastName().as(String.class)), keyword.toLowerCase() + "%");

			Predicate keywordCondition = cb.or(emailLike, firstNameLike, lastNameLike);

			query.where(cb.and(keywordCondition, isActivePredicate));

			Order sortingOrder = cb.asc(cb.selectCase()
				.when(cb.like(cb.lower(user.email().as(String.class)), keyword.toLowerCase() + "%"), 1)
				.when(cb.like(cb.lower(user.firstName().as(String.class)), keyword.toLowerCase() + "%"), 2)
				.when(cb.like(cb.lower(user.lastName().as(String.class)), keyword.toLowerCase() + "%"), 3)
				.otherwise(4));

			query.orderBy(sortingOrder);
			TypedQuery<AddressBookUserData> typedQuery = entityManager.createQuery(query);
			return typedQuery.getResultList();
		}

		return new ArrayList<>();
	}

	private AddressBookUserView getAddressBookUserView(CriteriaBuilder cb, Join<AddressBook, User> internalUserJoin,
			Join<User, Employee> employeeJoin, Join<AddressBook, ExternalUser> externalUserJoin) {
		Expression<Object> firstName = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), employeeJoin.get(Employee_.firstName))
			.otherwise(externalUserJoin.get(ExternalUser_.FIRST_NAME));

		Expression<Object> lastName = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), employeeJoin.get(Employee_.LAST_NAME))
			.otherwise(externalUserJoin.get(ExternalUser_.LAST_NAME));

		Expression<Object> phone = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), employeeJoin.get(Employee_.PHONE))
			.otherwise(externalUserJoin.get(ExternalUser_.PHONE));

		Expression<Object> userId = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), internalUserJoin.get(User_.USER_ID))
			.otherwise(externalUserJoin.get(ExternalUser_.ID));

		Expression<Object> email = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), internalUserJoin.get(User_.email))
			.otherwise(externalUserJoin.get(ExternalUser_.email));

		Expression<Object> userType = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), cb.literal("INTERNAL"))
			.otherwise(cb.literal("EXTERNAL"));

		Expression<Object> authPic = cb.selectCase()
			.when(cb.and(cb.isNotNull(internalUserJoin.get(User_.USER_ID)),
					cb.isNotNull(employeeJoin.get(Employee_.authPic))), employeeJoin.get(Employee_.authPic))
			.otherwise(cb.nullLiteral(Object.class));
		return new AddressBookUserView(firstName, lastName, userId, email, userType, authPic, phone);
	}

	private record AddressBookUserView(Expression<Object> firstName, Expression<Object> lastName,
			Expression<Object> userId, Expression<Object> email, Expression<Object> userType,
			Expression<Object> authPic, Expression<Object> phone) {
	}

}
