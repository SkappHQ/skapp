package com.skapp.enterprise.common.masterrepository;

import com.skapp.enterprise.common.model.master.FeatureAnnouncement;
import com.skapp.enterprise.common.type.AnnouncementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeatureAnnouncementDao extends JpaRepository<FeatureAnnouncement, Long> {

	@Query("SELECT DISTINCT fa FROM FeatureAnnouncement fa LEFT JOIN FETCH fa.recipients WHERE fa.status = :status ORDER BY fa.createdDate DESC")
	List<FeatureAnnouncement> findAllByStatusOrderByCreatedDateDesc(@Param("status") AnnouncementStatus status);

	@Query("SELECT DISTINCT fa FROM FeatureAnnouncement fa LEFT JOIN FETCH fa.recipients WHERE fa.announcementId IN :ids")
	List<FeatureAnnouncement> findAllWithRecipientsByIdIn(@Param("ids") List<Long> ids);

}
