package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.ExternalPersonSyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ExternalPersonSyncLogDao extends JpaRepository<ExternalPersonSyncLog, Long> {

    Optional<ExternalPersonSyncLog> findTopByOrderByStartedAtDesc();

}
