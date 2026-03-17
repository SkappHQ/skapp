package com.skapp.enterprise.common.masterrepository;

import com.skapp.enterprise.common.model.master.FeatureAnnouncement;
import com.skapp.enterprise.common.type.AnnouncementStatus;

import java.util.List;

public interface FeatureAnnouncementRepository {

	List<FeatureAnnouncement> findAllByStatusOrderByCreatedDateDesc(AnnouncementStatus status);

}
