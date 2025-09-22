package com.skapp.enterprise.esignature.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.AddressBook_;
import com.skapp.enterprise.esignature.model.ExternalUser;
import com.skapp.enterprise.esignature.model.ExternalUser_;
import com.skapp.enterprise.esignature.payload.request.AddressBookFilterDto;
import com.skapp.enterprise.esignature.repository.AddressBookRepository;
import com.skapp.enterprise.esignature.repository.projection.AddressBookSenderData;
import com.skapp.enterprise.esignature.repository.projection.AddressBookUserData;
import com.skapp.enterprise.esignature.type.UserType;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.CustomerContact;
import com.skapp.enterprise.invoice.model.CustomerContact_;
import com.skapp.enterprise.invoice.model.Customer_;
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
		Join<AddressBook, Customer> customerJoin = addressBookRoot.join(AddressBook_.CUSTOMER, JoinType.LEFT);
		Join<AddressBook, CustomerContact> customerContactJoin = addressBookRoot.join(AddressBook_.CUSTOMER_CONTACT,
				JoinType.LEFT);

		AddressBookUserView user = getAddressBookUserView(cb, internalUserJoin, employeeJoin, externalUserJoin,
				customerJoin, customerContactJoin);

		query.select(cb.construct(AddressBookUserData.class, addressBookRoot.get("id"), user.userId(), user.email(),
				user.userType(), user.firstName(), user.lastName(), user.authPic(), user.phone()));

		// Count query
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<AddressBook> countRoot = countQuery.from(AddressBook.class);

		Join<AddressBook, User> countInternalUserJoin = countRoot.join(AddressBook_.INTERNAL_USER, JoinType.LEFT);
		Join<AddressBook, ExternalUser> countExternalUserJoin = countRoot.join(AddressBook_.EXTERNAL_USER,
				JoinType.LEFT);
		Join<User, Employee> countEmployeeJoin = countInternalUserJoin.join(User_.EMPLOYEE, JoinType.LEFT);
		Join<AddressBook, Customer> countCustomerJoin = countRoot.join(AddressBook_.CUSTOMER, JoinType.LEFT);
		Join<AddressBook, CustomerContact> countCustomerContactJoin = countRoot.join(AddressBook_.CUSTOMER_CONTACT,
				JoinType.LEFT);

		AddressBookUserView countUser = getAddressBookUserView(cb, countInternalUserJoin, countEmployeeJoin,
				countExternalUserJoin, countCustomerJoin, countCustomerContactJoin);

		countQuery.select(cb.count(countRoot));

		// Apply filters to both queries
		List<Predicate> predicates = new ArrayList<>();
		List<Predicate> countPredicates = new ArrayList<>();

		// Active records only
		predicates.add(cb.isTrue(addressBookRoot.get(AddressBook_.IS_ACTIVE)));
		countPredicates.add(cb.isTrue(countRoot.get(AddressBook_.IS_ACTIVE)));

		// User type filter
		List<UserType> userTypes = addressBookFilterDto.getUserType();
		if (userTypes != null && userTypes.size() == 1) {
			predicates.add(cb.equal(addressBookRoot.get(AddressBook_.TYPE), userTypes.getFirst()));
			countPredicates.add(cb.equal(countRoot.get(AddressBook_.TYPE), userTypes.getFirst()));
		}

		// Keyword search
		String keyword = addressBookFilterDto.getSearchKeyword();
		if (keyword != null && !keyword.trim().isEmpty()) {
			String searchTerm = keyword.toLowerCase() + "%";

			// Main query predicates
			Predicate firstNameLike = cb.like(cb.lower(user.firstName().as(String.class)), searchTerm);
			Predicate lastNameLike = cb.like(cb.lower(user.lastName().as(String.class)), searchTerm);
			Predicate emailLike = cb.like(cb.lower(user.email().as(String.class)), searchTerm);
			Predicate searchPredicate = cb.or(firstNameLike, lastNameLike, emailLike);
			predicates.add(searchPredicate);

			// Count query predicates
			Predicate countFirstNameLike = cb.like(cb.lower(countUser.firstName().as(String.class)), searchTerm);
			Predicate countLastNameLike = cb.like(cb.lower(countUser.lastName().as(String.class)), searchTerm);
			Predicate countEmailLike = cb.like(cb.lower(countUser.email().as(String.class)), searchTerm);
			Predicate countSearchPredicate = cb.or(countFirstNameLike, countLastNameLike, countEmailLike);
			countPredicates.add(countSearchPredicate);

			// Add a consistent primary sorting by ID to ensure consistency across pages
			Order relevanceOrder = cb.asc(cb.selectCase()
				.when(cb.like(cb.lower(user.firstName().as(String.class)), searchTerm), 1)
				.when(cb.like(cb.lower(user.lastName().as(String.class)), searchTerm), 2)
				.when(cb.like(cb.lower(user.email().as(String.class)), searchTerm), 3)
				.otherwise(4));

			// Add a second order by addressBookId to ensure consistency across pages
			query.orderBy(relevanceOrder, cb.asc(addressBookRoot.get("id")));
		}
		else {
			// The "id" is just used as a tie-breaker to ensure stable sorting
			// Using the same direction for the "id" in both cases maintains consistency
			// in how ties are broken
			if (addressBookFilterDto.getSortOrder().isAscending()) {
				query.orderBy(cb.asc(user.firstName()), cb.asc(user.lastName()), cb.asc(addressBookRoot.get("id")));
			}
			else {
				query.orderBy(cb.desc(user.firstName()), cb.desc(user.lastName()), cb.asc(addressBookRoot.get("id")));
			}
		}

		// Apply predicates to queries
		query.where(predicates.toArray(new Predicate[0]));
		countQuery.where(countPredicates.toArray(new Predicate[0]));

		// Pagination setup
		int page = addressBookFilterDto.getPage();
		int size = addressBookFilterDto.getSize();

		// Get total count first
		Long totalItems = entityManager.createQuery(countQuery).getSingleResult();
		int totalPages = (int) Math.ceil((double) totalItems / size);

		// Execute the main query with pagination
		TypedQuery<AddressBookUserData> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult(page * size);
		typedQuery.setMaxResults(size);

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
			Join<AddressBook, Customer> customerJoin = addressBookRoot.join(AddressBook_.CUSTOMER, JoinType.LEFT);
			Join<AddressBook, CustomerContact> customerContactJoin = addressBookRoot.join(AddressBook_.CUSTOMER_CONTACT,
					JoinType.LEFT);

			AddressBookUserView user = getAddressBookUserView(cb, internalUserJoin, employeeJoin, externalUserJoin,
					customerJoin, customerContactJoin);

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

	@Override
	public List<AddressBookSenderData> fetchAddressBookEsignSenderByEmailPriority(String keyword) {
		if (keyword != null && !keyword.trim().isEmpty()) {
			CriteriaBuilder cb = entityManager.getCriteriaBuilder();
			CriteriaQuery<AddressBookSenderData> query = cb.createQuery(AddressBookSenderData.class);
			Root<AddressBook> addressBookRoot = query.from(AddressBook.class);

			Join<AddressBook, User> internalUserJoin = addressBookRoot.join(AddressBook_.INTERNAL_USER, JoinType.LEFT);
			Join<User, Employee> employeeJoin = internalUserJoin.join(User_.EMPLOYEE, JoinType.LEFT);
			Join<Employee, EmployeeRole> employeeRoleJoin = employeeJoin.join(Employee_.EMPLOYEE_ROLE, JoinType.LEFT);

			AddressBookSenderView user = getAddressBookSenderView(cb, internalUserJoin, employeeJoin);

			query.select(cb.construct(AddressBookSenderData.class, addressBookRoot.get("id"), user.userId(),
					user.email(), user.firstName(), user.lastName(), user.phone(), employeeRoleJoin.get("esignRole"),
					user.authPic()));

			Predicate isActivePredicate = cb.isTrue(addressBookRoot.get(AddressBook_.IS_ACTIVE));
			Predicate esignRolePredicate = employeeRoleJoin.get("esignRole")
				.in(Role.ESIGN_SENDER, Role.ESIGN_ADMIN, Role.SUPER_ADMIN);

			Predicate emailLike = cb.like(cb.lower(user.email().as(String.class)), keyword.toLowerCase() + "%");
			Predicate firstNameLike = cb.like(cb.lower(user.firstName().as(String.class)), keyword.toLowerCase() + "%");
			Predicate lastNameLike = cb.like(cb.lower(user.lastName().as(String.class)), keyword.toLowerCase() + "%");

			Predicate keywordCondition = cb.or(emailLike, firstNameLike, lastNameLike);

			query.where(cb.and(isActivePredicate, esignRolePredicate, keywordCondition));

			Order sortingOrder = cb.asc(cb.selectCase()
				.when(cb.like(cb.lower(user.email().as(String.class)), keyword.toLowerCase() + "%"), 1)
				.when(cb.like(cb.lower(user.firstName().as(String.class)), keyword.toLowerCase() + "%"), 2)
				.when(cb.like(cb.lower(user.lastName().as(String.class)), keyword.toLowerCase() + "%"), 3)
				.otherwise(4));

			query.orderBy(sortingOrder);
			TypedQuery<AddressBookSenderData> typedQuery = entityManager.createQuery(query);
			return typedQuery.getResultList();
		}

		return new ArrayList<>();
	}

	private AddressBookUserView getAddressBookUserView(CriteriaBuilder cb, Join<AddressBook, User> internalUserJoin,
			Join<User, Employee> employeeJoin, Join<AddressBook, ExternalUser> externalUserJoin,
			Join<AddressBook, Customer> customerJoin, Join<AddressBook, CustomerContact> customerContactJoin) {
		Expression<Object> firstName = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), employeeJoin.get(Employee_.firstName))
			.when(cb.isNotNull(externalUserJoin.get(ExternalUser_.ID)), externalUserJoin.get(ExternalUser_.FIRST_NAME))
			.when(cb.isNotNull(customerJoin.get(Customer_.ID)), customerJoin.get(Customer_.NAME))
			.otherwise(customerContactJoin.get(CustomerContact_.NAME));

		Expression<Object> lastName = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), employeeJoin.get(Employee_.LAST_NAME))
			.otherwise(externalUserJoin.get(ExternalUser_.LAST_NAME));

		Expression<Object> phone = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), employeeJoin.get(Employee_.PHONE))
			.when(cb.isNotNull(externalUserJoin.get(ExternalUser_.ID)), externalUserJoin.get(ExternalUser_.PHONE))
			.otherwise(customerContactJoin.get(CustomerContact_.CONTACT_NO));

		Expression<Object> userId = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), internalUserJoin.get(User_.USER_ID))
			.when(cb.isNotNull(externalUserJoin.get(ExternalUser_.ID)), externalUserJoin.get(ExternalUser_.ID))
			.when(cb.isNotNull(customerJoin.get(Customer_.ID)), customerJoin.get(Customer_.ID))
			.otherwise(customerContactJoin.get(CustomerContact_.ID));

		Expression<Object> email = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), internalUserJoin.get(User_.email))
			.when(cb.isNotNull(externalUserJoin.get(ExternalUser_.ID)), externalUserJoin.get(ExternalUser_.email))
			.when(cb.isNotNull(customerJoin.get(Customer_.ID)), customerJoin.get(Customer_.email))
			.otherwise(customerContactJoin.get(CustomerContact_.email));

		Expression<Object> userType = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), cb.literal("INTERNAL"))
			.when(cb.isNotNull(externalUserJoin.get(ExternalUser_.ID)), cb.literal("EXTERNAL"))
			.otherwise(cb.literal("CUSTOMER"));

		Expression<Object> authPic = cb.selectCase()
			.when(cb.and(cb.isNotNull(internalUserJoin.get(User_.USER_ID)),
					cb.isNotNull(employeeJoin.get(Employee_.authPic))), employeeJoin.get(Employee_.authPic))
			.otherwise(cb.nullLiteral(Object.class));
		return new AddressBookUserView(firstName, lastName, userId, email, userType, authPic, phone);
	}

	private AddressBookSenderView getAddressBookSenderView(CriteriaBuilder cb, Join<AddressBook, User> internalUserJoin,
			Join<User, Employee> employeeJoin) {
		Expression<Object> firstName = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), employeeJoin.get(Employee_.FIRST_NAME))
			.otherwise(cb.nullLiteral(Object.class));

		Expression<Object> lastName = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), employeeJoin.get(Employee_.LAST_NAME))
			.otherwise(cb.nullLiteral(Object.class));

		Expression<Object> phone = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), employeeJoin.get(Employee_.PHONE))
			.otherwise(cb.nullLiteral(Object.class));

		Expression<Object> userId = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), internalUserJoin.get(User_.USER_ID))
			.otherwise(cb.nullLiteral(Object.class));

		Expression<Object> email = cb.selectCase()
			.when(cb.isNotNull(internalUserJoin.get(User_.USER_ID)), internalUserJoin.get(User_.EMAIL))
			.otherwise(cb.nullLiteral(Object.class));

		Expression<Object> authPic = cb.selectCase()
			.when(cb.and(cb.isNotNull(internalUserJoin.get(User_.USER_ID)),
					cb.isNotNull(employeeJoin.get(Employee_.authPic))), employeeJoin.get(Employee_.authPic))
			.otherwise(cb.nullLiteral(Object.class));

		return new AddressBookSenderView(firstName, lastName, userId, email, phone, authPic);
	}

	private record AddressBookUserView(Expression<Object> firstName, Expression<Object> lastName,
			Expression<Object> userId, Expression<Object> email, Expression<Object> userType,
			Expression<Object> authPic, Expression<Object> phone) {
	}

	private record AddressBookSenderView(Expression<Object> firstName, Expression<Object> lastName,
			Expression<Object> userId, Expression<Object> email, Expression<Object> phone, Expression<Object> authPic) {
	}

}
