package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.ExternalSyncStaging;
import com.skapp.community.peopleplanner.model.ExternalSyncStaging.Decision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExternalSyncStagingDao extends JpaRepository<ExternalSyncStaging, Long> {

    List<ExternalSyncStaging> findAllByDecision(Decision decision);

    List<ExternalSyncStaging> findAllByChangeTypeIn(List<ExternalSyncStaging.ChangeType> changeTypes);

    Optional<ExternalSyncStaging> findByEmailAndDecision(String email, Decision decision);

    @Transactional
    void deleteByDecisionIn(List<Decision> decisions);
}
