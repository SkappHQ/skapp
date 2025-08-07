package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.repository.projection.LeaveTrendByDay;
import com.skapp.community.leaveplanner.repository.projection.LeaveTrendByMonth;
import com.skapp.community.leaveplanner.repository.projection.LeaveTypeBreakDown;
import com.skapp.community.leaveplanner.repository.projection.LeaveUtilizationByEmployeeMonthly;
import com.skapp.community.leaveplanner.repository.projection.ManagerLeaveTrend;
import com.skapp.community.leaveplanner.repository.projection.OrganizationLeaveTrendForTheYear;
import com.skapp.community.leaveplanner.repository.projection.TeamLeaveCountByType;
import com.skapp.community.leaveplanner.repository.projection.TeamLeaveTrendForTheYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestDao
        extends JpaRepository<LeaveRequest, Long>, JpaSpecificationExecutor<LeaveRequest>, LeaveRequestRepository {

}
