package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.ExternalSyncStaging;
import com.skapp.community.peopleplanner.model.ExternalSyncStaging.Decision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ExternalSyncStagingDao extends JpaRepository<ExternalSyncStaging, Long> {

    List<ExternalSyncStaging> findAllByDecision(Decision decision);

    List<ExternalSyncStaging> findAllByChangeTypeIn(List<ExternalSyncStaging.ChangeType> changeTypes);

    @Transactional
    void deleteByDecisionIn(List<Decision> decisions);
}
