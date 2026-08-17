package com.skapp.community.leaveplanner.service;

import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.payload.PolicyLeaveBalanceDto;

import java.time.LocalDate;

public interface PolicyLeaveBalanceService {

	PolicyLeaveBalanceDto calculateBalanceForYear(EmployeeLeavePolicy assignment, int year);

	PolicyLeaveBalanceDto calculateBalanceForDate(EmployeeLeavePolicy assignment, LocalDate date);

}
