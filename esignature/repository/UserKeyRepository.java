package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.UserKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserKeyRepository extends JpaRepository<UserKey, Long> {

	Optional<UserKey> findByAddressBookId(Long addressBookId);

}
