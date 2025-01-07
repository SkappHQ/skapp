package com.skapp.enterprise.common.repository;

import com.skapp.enterprise.common.model.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceTokenDao extends JpaRepository<DeviceToken, Long> {

	List<DeviceToken> findAllByUserId(Long id);

	Optional<DeviceToken> findByToken(String deviceToken);

}
