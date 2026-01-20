package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.TemplateRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplateRecipientDao extends JpaRepository<TemplateRecipient, Long> {

}
