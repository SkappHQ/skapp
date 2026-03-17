package com.skapp.enterprise.common.masterrepository;

import com.skapp.enterprise.common.model.master.FeatureAnnouncementRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeatureAnnouncementRecipientDao extends JpaRepository<FeatureAnnouncementRecipient, Long> {

	List<FeatureAnnouncementRecipient> findByFeatureAnnouncementAnnouncementId(Long announcementId);

	void deleteByFeatureAnnouncementAnnouncementId(Long announcementId);

}
