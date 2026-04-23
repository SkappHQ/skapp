package com.skapp.enterprise.pm.repository;

import com.skapp.enterprise.pm.model.GuestUserRequest;
import com.skapp.enterprise.pm.type.GuestUserRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuestUserRequestDao extends JpaRepository<GuestUserRequest, Long> {

	boolean existsByEmail(String email);

	boolean existsByEmailAndStatus(String email, GuestUserRequestStatus status);

	List<GuestUserRequest> findAllByStatus(GuestUserRequestStatus status);

	List<GuestUserRequest> findByEmailAndStatus(String email, GuestUserRequestStatus status);

}
