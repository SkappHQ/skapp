package com.skapp.enterprise.common.masterrepository;

import com.skapp.enterprise.common.model.master.SuperAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SuperAdminDao extends JpaRepository<SuperAdmin, Long> {

}
