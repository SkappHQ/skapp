package com.skapp.enterprise.pm.repository;

import com.skapp.enterprise.pm.model.GuestUserRequest;

import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public interface GuestUserRequestRepository {

	Optional<GuestUserRequest> findByIdWithRequestedUser(Long id);

}
