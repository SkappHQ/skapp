package com.skapp.enterprise.common.repository;

import com.skapp.enterprise.common.model.SupportRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportRequestDao extends JpaRepository<SupportRequest, Long> {

}
