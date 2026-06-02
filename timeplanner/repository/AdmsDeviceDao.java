package com.skapp.enterprise.timeplanner.repository;

import com.skapp.enterprise.timeplanner.model.AdmsDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdmsDeviceDao extends JpaRepository<AdmsDevice, Long> {

	Optional<AdmsDevice> findBySerialNumber(String serialNumber);

}
