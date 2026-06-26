package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.GoogleWorkspaceSyncStaging;
import com.skapp.community.peopleplanner.model.GoogleWorkspaceSyncStaging.Decision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface GoogleWorkspaceSyncStagingDao extends JpaRepository<GoogleWorkspaceSyncStaging, Long> {

    List<GoogleWorkspaceSyncStaging> findAllByDecision(Decision decision);

    @Transactional
    void deleteByDecisionIn(List<Decision> decisions);

}
