package com.skapp.enterprise.people.repository;

import com.skapp.community.peopleplanner.model.EmployeeRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EpEmployeeRoleDao extends JpaRepository<EmployeeRole, Long>, EpEmployeeRoleRepository {

}
