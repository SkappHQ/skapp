package com.skapp.enterprise.common.repository;

import com.skapp.community.common.model.User;
import com.skapp.enterprise.common.model.EmployeeCalendar;
import com.skapp.enterprise.common.type.EpCalendarType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeCalendarDao extends JpaRepository<EmployeeCalendar, Long> {

	EmployeeCalendar findByUserAndCalendarType(User user, EpCalendarType calendarType);

}
