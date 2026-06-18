package com.skapp.community.peopleplanner.repository;

import com.skapp.community.common.type.ModuleType;
import com.skapp.community.peopleplanner.model.ModuleRolesRestriction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModuleRolesRestrictionDao extends JpaRepository<ModuleRolesRestriction, ModuleType> {

}
