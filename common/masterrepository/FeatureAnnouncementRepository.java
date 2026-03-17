package com.skapp.enterprise.common.masterrepository;

import com.skapp.enterprise.common.model.master.FeatureAnnouncement;
import com.skapp.enterprise.common.type.AnnouncementStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FeatureAnnouncementRepository {

	List<FeatureAnnouncement> findAllByStatusOrderByCreatedDateDesc(AnnouncementStatus status);

	List<FeatureAnnouncement> findAllWithRecipientsByIdIn(List<Long> ids);

	Page<FeatureAnnouncement> findAllWithRecipients(Pageable pageable);

}
