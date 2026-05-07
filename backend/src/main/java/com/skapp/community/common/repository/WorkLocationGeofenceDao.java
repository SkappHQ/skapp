package com.skapp.community.common.repository;

import com.skapp.community.common.model.WorkLocationGeofence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkLocationGeofenceDao extends JpaRepository<WorkLocationGeofence, Long> {

	Optional<WorkLocationGeofence> findByWorkLocationWorkLocationId(Long workLocationId);

	List<WorkLocationGeofence> findByWorkLocationWorkLocationIdIn(Collection<Long> workLocationIds);

}
