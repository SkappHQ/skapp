package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeBulkDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeDataValidationDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeExportFilterDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeFilterDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeQuickAddDto;
import com.skapp.community.peopleplanner.payload.request.NotificationSettingsPatchRequestDto;
import com.skapp.community.peopleplanner.payload.request.PermissionFilterDto;
import com.skapp.community.peopleplanner.payload.request.employee.CreateEmployeeRequestDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeManagerResponseDto;
import com.skapp.community.peopleplanner.type.AccountStatus;

import java.util.List;

public interface PeopleService {

	ResponseEntityDto createEmployee(CreateEmployeeRequestDto createEmployeeRequestDto);

	ResponseEntityDto quickAddEmployee(EmployeeQuickAddDto employeeQuickAddDto);

	ResponseEntityDto updateEmployee(Long employeeId, CreateEmployeeRequestDto createEmployeeRequestDto);

	ResponseEntityDto getEmployees(EmployeeFilterDto employeeFilterDto);

	ResponseEntityDto exportEmployees(EmployeeExportFilterDto employeeExportFilterDto);

	ResponseEntityDto getCurrentEmployee();

	ResponseEntityDto addBulkEmployees(List<EmployeeBulkDto> employeeBulkDto);

	ResponseEntityDto getLoginPendingEmployeeCount();

	ResponseEntityDto searchEmployeesByNameOrEmail(PermissionFilterDto permissionFilterDto);

	ResponseEntityDto searchEmployeesByEmail(String email);

	ResponseEntityDto getEmployeeByIdOrEmail(EmployeeDataValidationDto employeeDataValidationDto);

	ResponseEntityDto terminateUser(Long userId);

	ResponseEntityDto deleteUser(Long userId);

	List<EmployeeManagerResponseDto> getCurrentEmployeeManagers();

	ResponseEntityDto updateNotificationSettings(
			NotificationSettingsPatchRequestDto notificationSettingsPatchRequestDto);

	ResponseEntityDto getNotificationSettings();

	boolean isManagerAvailableForCurrentEmployee();

	ResponseEntityDto searchEmployeesAndTeamsByKeyword(String keyword);

	ResponseEntityDto isPrimarySecondaryOrTeamSupervisor(Long employeeId);

	ResponseEntityDto hasSupervisoryRoles(Long employeeId);

	void modifySubscriptionQuantity(long quantity, boolean isIncrement, boolean isFromEmployeeBulk);

	void updateUserStatus(Long userId, AccountStatus status, boolean isDelete);

}
