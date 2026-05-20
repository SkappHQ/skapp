package com.skapp.enterprise.timeplanner.repository;

import com.skapp.enterprise.timeplanner.model.AdmsAttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdmsAttendanceLogDao extends JpaRepository<AdmsAttendanceLog, Long> {

}
