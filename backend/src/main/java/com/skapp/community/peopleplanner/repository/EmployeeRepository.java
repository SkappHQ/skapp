package com.skapp.community.peopleplanner.repository;

import com.skapp.community.leaveplanner.payload.AdminOnLeaveDto;
import com.skapp.community.leaveplanner.payload.EmployeeLeaveRequestDto;
import com.skapp.community.leaveplanner.payload.EmployeesOnLeaveFilterDto;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.payload.request.EmployeeExportFilterDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeFilterDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeFilterDtoV2;
import com.skapp.community.peopleplanner.payload.request.PermissionFilterDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeCountDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeManagerDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeTeamDto;
import com.skapp.community.peopleplanner.payload.response.PrimarySecondaryOrTeamSupervisorResponseDto;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.peopleplanner.type.EmploymentType;
import com.skapp.community.peopleplanner.type.Gender;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface EmployeeRepository {

	Optional<Employee> findEmployeeByEmployeeIdAndUserActiveNot(Long employeeId, boolean userState);

	Page<Employee> findEmployees(EmployeeFilterDto employeeFilterDto, Pageable page);

	List<Employee> findEmployees(List<Long> employeeIds, String searchTerm, Set<AccountStatus> accountStatuses);

	List<Employee> findEmployeesForExport(EmployeeExportFilterDto employeeExportFilterDto);

	List<EmployeeTeamDto> findTeamsByEmployees(List<Long> employeeIds);

	List<EmployeeManagerDto> findManagersByEmployeeIds(List<Long> employeeId);

	EmployeeCountDto getLoginPendingEmployeeCount();

	List<Employee> findEmployeeByNameEmail(String search, PermissionFilterDto permissionFilterDto);

	Employee findEmployeeByEmail(String email);

	Page<Employee> findEmployeesByManagerId(Long managerId, Pageable page);

	AdminOnLeaveDto findAllEmployeesOnLeave(EmployeesOnLeaveFilterDto filterDto, Long currentUserId,
			boolean isLeaveAdmin);

	List<Long> findEmployeeIdsByManagerId(Long employeeId);

	Long findAllActiveEmployeesCount();

	List<Employee> findManagersByEmployeeIdAndLoggedInManagerId(@NonNull Long employeeId, Long managerId);

	List<EmployeeLeaveRequestDto> getEmployeesOnLeaveByTeam(EmployeesOnLeaveFilterDto filterDto, Long currentUserId);

	List<Employee> findInformantManagersByEmployeeID(Long employeeId);

	Long countByIsActiveAndTeams(List<Long> teamIds, AccountStatus accountStatus);

	Long countByIsActiveAndTeamsAndCreatedAt(boolean isActive, List<Long> teamIds, int currentYear);

	Double findAverageAgeOfActiveEmployeesByTeamIds(List<Long> teamIds);

	Long countTerminatedEmployeesByStartDateAndEndDateAndTeams(LocalDate startDate, LocalDate endDate,
			List<Long> teamId);

	Long countByCreateDateRangeAndTeams(LocalDate endDate, List<Long> teamId);

	Long countByIsActiveAndTeamsAndGender(boolean isActive, List<Long> teamIds, Gender gender);

	Long countByEmploymentTypeAndEmploymentAllocationAndTeams(EmploymentType employmentType,
			EmploymentAllocation employmentAllocation, List<Long> teamIds);

	List<Employee> findByNameAndIsActiveAndTeam(String employeeName, Boolean isActive, Long teamId);

	Long countEmployeesByManagerId(Long managerId);

	Long countEmployeesByPrimaryManagerId(Long managerId);

	List<Employee> findEmployeeByName(String keyword);

	PrimarySecondaryOrTeamSupervisorResponseDto isPrimarySecondaryOrTeamSupervisor(Employee employee,
			Employee currentEmployee);

	PrimarySecondaryOrTeamSupervisorResponseDto isPrimaryOrSecondarySupervisor(Employee employee);

	Long findAllActiveAndPendingEmployeesCount();

	Page<Employee> findEmployeesV2(EmployeeFilterDtoV2 employeeFilterDto, Pageable pageable);

}
