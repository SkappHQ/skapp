package com.skapp.enterprise.pm.repository;

import com.skapp.enterprise.pm.model.GuestUserRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuestUserRequestDao extends JpaRepository<GuestUserRequest, Long> {

	List<GuestUserRequest> findByEmail(String email);

}
