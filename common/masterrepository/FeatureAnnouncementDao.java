package com.skapp.enterprise.common.masterrepository;

import com.skapp.enterprise.common.model.master.FeatureAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeatureAnnouncementDao extends JpaRepository<FeatureAnnouncement, Long>, FeatureAnnouncementRepository {

}
