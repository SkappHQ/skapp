package com.skapp.enterprise.esignature.repository;

import com.skapp.community.common.model.User;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.ExternalUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AddressBookDao extends JpaRepository<AddressBook, Long>, AddressBookRepository {

	void deleteByInternalUserUserId(Long internalUserId);

	Optional<AddressBook> findByInternalUser(User internalUser);

	Optional<AddressBook> findByExternalUser(ExternalUser externalUser);

	Optional<AddressBook> findByInternalUserEmail(String email);

	Optional<AddressBook> findByExternalUserEmail(String email);

}
