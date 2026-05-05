package com.skapp.enterprise.ai.repository;

import com.skapp.enterprise.ai.model.AiPromptLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiPromptLogDao extends JpaRepository<AiPromptLog, Long> {

}
