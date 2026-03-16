package com.skapp.enterprise.common.repository;

import com.skapp.enterprise.common.model.AnnouncementUserInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnouncementUserInteractionDao extends JpaRepository<AnnouncementUserInteraction, Long> {

	Optional<AnnouncementUserInteraction> findByEmployee_EmployeeIdAndAnnouncement_AnnouncementId(Long employeeId,
																								  Long announcementId);

	List<AnnouncementUserInteraction> findAllByEmployee_EmployeeIdAndAnnouncement_AnnouncementIdIn(Long employeeId,
																								   List<Long> announcementIds);

}

