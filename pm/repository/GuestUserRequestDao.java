package com.skapp.enterprise.pm.repository;

import com.skapp.enterprise.pm.model.GuestUserRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuestUserRequestDao extends JpaRepository<GuestUserRequest, Long>, GuestUserRequestRepository {

	List<GuestUserRequest> findByEmailContaining(String email);

	Optional<GuestUserRequest> findByEmailIgnoreCase(String email);

}
