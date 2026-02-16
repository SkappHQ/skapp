package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.TemplateField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplateFieldDao extends JpaRepository<TemplateField, Long> {

}
