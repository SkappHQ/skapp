package com.skapp.community.peopleplanner.repository;

import com.skapp.community.common.type.ModuleType;
import com.skapp.community.peopleplanner.model.ModuleRoleRestriction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModuleRoleRestrictionDao extends JpaRepository<ModuleRoleRestriction, ModuleType> {

}
