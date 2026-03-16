package com.skapp.enterprise.common.repository;

import com.skapp.enterprise.common.model.master.FeatureAnnouncement;
import com.skapp.enterprise.common.type.AnnouncementStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeatureAnnouncementDao extends JpaRepository<FeatureAnnouncement, Long> {

	List<FeatureAnnouncement> findAllByStatusOrderByCreatedDateDesc(AnnouncementStatus status);

	Page<FeatureAnnouncement> findAll(Pageable pageable);

}
