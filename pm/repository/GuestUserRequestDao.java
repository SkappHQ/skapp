package com.skapp.enterprise.pm.repository;

import com.skapp.enterprise.pm.model.GuestUserRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestUserRequestDao extends JpaRepository<GuestUserRequest, Long> {

	boolean existsByEmail(String email);

}
