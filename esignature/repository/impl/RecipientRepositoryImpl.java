package com.skapp.enterprise.esignature.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.AddressBook_;
import com.skapp.enterprise.esignature.model.ExternalUser;
import com.skapp.enterprise.esignature.model.ExternalUser_;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.model.Recipient_;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.type.UserType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RecipientRepositoryImpl implements RecipientRepository {

	private final EntityManager entityManager;

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

}
