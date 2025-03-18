package com.skapp.enterprise.leaveplanner.service.impl;

import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.BulkContextService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.repository.CarryForwardInfoDao;
import com.skapp.community.leaveplanner.repository.LeaveEntitlementDao;
import com.skapp.community.leaveplanner.repository.LeaveTypeDao;
import com.skapp.community.leaveplanner.service.LeaveCycleService;
import com.skapp.community.leaveplanner.service.LeaveEmailService;
import com.skapp.community.leaveplanner.service.LeaveNotificationService;
import com.skapp.community.leaveplanner.service.impl.LeaveEntitlementServiceImpl;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.enterprise.common.type.Tier;
import com.skapp.enterprise.people.service.EpUserService;
import com.skapp.enterprise.people.service.impl.EpEmployeeTimelineServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.List;

@Slf4j
@Service
@Primary
public class EpLeaveEntitlementServiceImpl extends LeaveEntitlementServiceImpl {

	private final EpEmployeeTimelineServiceImpl epEmployeeTimelineServiceImpl;

	private final EpUserService epUserService;

	public EpLeaveEntitlementServiceImpl(MessageUtil messageUtil, EmployeeDao employeeDao,
			LeaveCycleService leaveCycleService, LeaveTypeDao leaveTypeDao, LeaveEntitlementDao leaveEntitlementDao,
			LeaveMapper leaveMapper, PeopleMapper peopleMapper, CarryForwardInfoDao carryForwardInfoDao,
			PageTransformer pageTransformer, PlatformTransactionManager transactionManager, UserDao userDao,
			UserService userService, LeaveEmailService leaveEmailService,
			LeaveNotificationService leaveNotificationService, BulkContextService bulkContextService,
			EpEmployeeTimelineServiceImpl epEmployeeTimelineServiceImpl, EpUserService epUserService) {
		super(messageUtil, employeeDao, leaveCycleService, leaveTypeDao, leaveEntitlementDao, leaveMapper, peopleMapper,
				carryForwardInfoDao, pageTransformer, transactionManager, userDao, userService, leaveEmailService,
				leaveNotificationService, bulkContextService);
		this.epEmployeeTimelineServiceImpl = epEmployeeTimelineServiceImpl;
		this.epUserService = epUserService;
	}

	@Override
	protected void addCustomLeaveEntitlementsTimeLineRecords(Employee employee, LeaveEntitlement leaveEntitlement) {
		Tier currentUserTier = epUserService.getCurrentUserTier();
		if (currentUserTier == Tier.PRO) {
			epEmployeeTimelineServiceImpl.addCustomLeaveEntitlementsTimeLineRecords(employee, leaveEntitlement);
		}
	}

	@Override
	protected void addBulkLeaveEntitlementsTimeLineRecords(Employee employee, List<LeaveEntitlement> entitlements) {
		Tier currentUserTier = epUserService.getCurrentUserTier();
		if (currentUserTier == Tier.PRO) {
			epEmployeeTimelineServiceImpl.addBulkLeaveEntitlementsTimeLineRecords(employee, entitlements, false);
		}
	}

	@Override
	protected void addDeletedLeaveEntitlementsTimeLineRecords(Employee employee, String oldHistoryRecord) {
		Tier currentUserTier = epUserService.getCurrentUserTier();
		if (currentUserTier == Tier.PRO) {
			epEmployeeTimelineServiceImpl.addDeletedLeaveEntitlementsTimeLineRecords(employee, oldHistoryRecord);
		}
	}

	@Override
	protected void addUpdatedLeaveEntitlementsTimeLineRecords(Employee employee, String oldHistoryRecord,
			String newHistoryRecord, boolean isCustom) {
		Tier currentUserTier = epUserService.getCurrentUserTier();
		if (currentUserTier == Tier.PRO) {
			epEmployeeTimelineServiceImpl.addUpdatedLeaveEntitlementsTimeLineRecords(employee, oldHistoryRecord,
					newHistoryRecord, isCustom);
		}
	}

}
