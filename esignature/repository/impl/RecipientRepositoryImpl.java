package com.skapp.enterprise.esignature.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.AddressBook_;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Envelope_;
import com.skapp.enterprise.esignature.model.ExternalUser;
import com.skapp.enterprise.esignature.model.ExternalUser_;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.model.Recipient_;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import com.skapp.enterprise.esignature.type.UserType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class RecipientRepositoryImpl implements RecipientRepository {

	private final EntityManager entityManager;

	/**
	 * Retrieves the phone number associated with a recipient by their ID.
	 * <p>
	 * Performs joins between Recipient, AddressBook, User, Employee, and ExternalUser
	 * entities. Returns the phone number based on the recipient's user type:
	 * <ul>
	 * <li>If the user type is EXTERNAL, returns the phone from ExternalUser.</li>
	 * <li>If the user type is INTERNAL, returns the phone from Employee.</li>
	 * <li>Otherwise, returns null.</li>
	 * </ul>
	 * @param recipientId the ID of the recipient
	 * @return the phone number as a String, or null if not found
	 */
	@Override
	public String findPhoneByRecipientId(Long recipientId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<String> query = cb.createQuery(String.class);
		Root<Recipient> recipient = query.from(Recipient.class);

		Join<Recipient, AddressBook> addressBook = recipient.join(Recipient_.ADDRESS_BOOK);
		Join<AddressBook, User> internalUser = addressBook.join(AddressBook_.INTERNAL_USER, JoinType.LEFT);
		Join<User, Employee> employee = internalUser.join(User_.EMPLOYEE, JoinType.LEFT);
		Join<AddressBook, ExternalUser> externalUser = addressBook.join(AddressBook_.EXTERNAL_USER, JoinType.LEFT);

		CriteriaBuilder.Case<String> caseExpression = cb.selectCase();
		caseExpression
			.when(cb.equal(addressBook.get(AddressBook_.TYPE), UserType.EXTERNAL),
					externalUser.get(ExternalUser_.PHONE))
			.when(cb.equal(addressBook.get(AddressBook_.TYPE), UserType.INTERNAL), employee.get(Employee_.PHONE))
			.otherwise(cb.nullLiteral(String.class));

		query.select(caseExpression).where(cb.equal(recipient.get(Recipient_.ID), recipientId));

		return entityManager.createQuery(query).getSingleResult();
	}

	@Override
	public Long countPendingDocumentsForUser(Long currentUserId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> query = cb.createQuery(Long.class);
		Root<Envelope> envelope = query.from(Envelope.class);
		Join<Envelope, Recipient> recipientJoin = envelope.join(Envelope_.RECIPIENTS, JoinType.INNER);
		Join<Recipient, AddressBook> addressBookJoin = recipientJoin.join(Recipient_.ADDRESS_BOOK, JoinType.INNER);

		Predicate userPredicate = cb.equal(addressBookJoin.get(AddressBook_.INTERNAL_USER).get(User_.USER_ID),
				currentUserId);
		Predicate statusPredicate = cb.equal(recipientJoin.get(Recipient_.STATUS), RecipientStatus.NEED_TO_SIGN);

		query.select(cb.count(envelope)).where(cb.and(userPredicate, statusPredicate));

		return entityManager.createQuery(query).getSingleResult();
	}

	@Override
	public Long countPendingDocumentsForSendersAndAdmins() {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> query = cb.createQuery(Long.class);
		Root<Envelope> envelope = query.from(Envelope.class);
		Join<Envelope, Recipient> recipientJoin = envelope.join(Envelope_.RECIPIENTS, JoinType.INNER);

		Predicate statusPredicate = cb.equal(recipientJoin.get(Recipient_.STATUS), RecipientStatus.NEED_TO_SIGN);

		query.select(cb.count(envelope)).where(statusPredicate);

		return entityManager.createQuery(query).getSingleResult();

	}

}
