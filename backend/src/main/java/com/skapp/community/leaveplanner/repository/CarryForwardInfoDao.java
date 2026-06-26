package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.CarryForwardInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CarryForwardInfoDao extends JpaRepository<CarryForwardInfo, Long>,
		JpaSpecificationExecutor<CarryForwardInfo>, CarryForwardInfoRepository {

}
