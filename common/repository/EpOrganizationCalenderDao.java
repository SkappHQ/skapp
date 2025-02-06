package com.skapp.enterprise.common.repository;

import com.skapp.enterprise.common.model.OrganizationCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EpOrganizationCalenderDao
		extends JpaRepository<OrganizationCalendar, Long>, JpaSpecificationExecutor<OrganizationCalendar> {

}
