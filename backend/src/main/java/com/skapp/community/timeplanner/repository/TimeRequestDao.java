package com.skapp.community.timeplanner.repository;

import com.skapp.community.timeplanner.model.TimeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TimeRequestDao extends JpaRepository<TimeRequest, Long>, TimeRequestRepository {

}
