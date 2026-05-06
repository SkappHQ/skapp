package com.skapp.enterprise.pm.repository;

import com.skapp.enterprise.pm.model.GuestUserRequest;

import java.util.Optional;

public interface GuestUserRequestRepository {

	Optional<GuestUserRequest> findByIdWithRequestedUser(Long id);

}
