package com.skapp.enterprise.ai.repository;

import com.skapp.enterprise.ai.model.AiPromptLogMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiPromptLogMessageDao extends JpaRepository<AiPromptLogMessage, Long> {

}
