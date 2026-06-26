package com.skapp.community.timeplanner.repository;

import com.skapp.community.timeplanner.model.TimeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;

@Repository
public interface TimeConfigDao extends JpaRepository<TimeConfig, Long>, JpaSpecificationExecutor<TimeConfig> {

	TimeConfig findByDay(DayOfWeek day);

}
