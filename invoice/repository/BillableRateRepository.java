package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.BillableRate;
import com.skapp.enterprise.invoice.payload.request.ProjectMemberFilterDto;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillableRateRepository {

	List<BillableRate> findAllProjectTeamMembers(ProjectMemberFilterDto projectMemberFilterDto);

}
