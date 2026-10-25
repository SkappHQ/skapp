package com.skapp.community.crmplanner.repository;

import com.skapp.community.peopleplanner.model.Employee;
import org.springframework.data.repository.Repository;

public interface CrmActivityTeamMemberDao extends Repository<Employee, Long>, CrmActivityTeamMemberRepository {

}
