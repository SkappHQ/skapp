package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.ExternalPersonSyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExternalPersonSyncLogDao extends JpaRepository<ExternalPersonSyncLog, Long> {
}
