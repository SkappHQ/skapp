package com.skapp.enterprise.common.repository;

import com.skapp.enterprise.common.model.AnnouncementUserInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnouncementUserInteractionDao extends JpaRepository<AnnouncementUserInteraction, Long> {

	Optional<AnnouncementUserInteraction> findByEmployee_EmployeeIdAndAnnouncementId(Long employeeId,
			String announcementId);

	List<AnnouncementUserInteraction> findAllByEmployee_EmployeeIdAndAnnouncementIdIn(Long employeeId,
			List<String> announcementIds);

}
