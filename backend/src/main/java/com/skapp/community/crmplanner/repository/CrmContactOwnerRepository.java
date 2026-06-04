package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.request.CrmContactOwnerFilterDto;
import com.skapp.community.peopleplanner.model.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrmContactOwnerRepository {

	Page<Employee> findContactOwners(CrmContactOwnerFilterDto filterDto, Pageable pageable);

}
