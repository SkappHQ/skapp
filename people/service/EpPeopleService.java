package com.skapp.enterprise.people.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.people.payload.request.DeactivateUsersRequestDto;
import com.skapp.enterprise.people.payload.request.TransferManagersAndSupervisorsRequestDto;
import com.skapp.enterprise.people.payload.request.UpdateUserLanguageRequestDto;

import java.util.List;

public interface EpPeopleService {

	ResponseEntityDto getEmployeesLimit();

	boolean checkEmployeesLimit();

	void invalidateAllUserCaches();

	ResponseEntityDto getEmployeeRoleLimit();

	ResponseEntityDto getEmployeesCount();

	ResponseEntityDto getManagersAndSupervisorsFromEmployeeIds(List<Long> employeeIds);

	ResponseEntityDto transferSupervisorsAndManagers(
			TransferManagersAndSupervisorsRequestDto transferManagersAndSupervisorsRequestDto);

	ResponseEntityDto getManagerRoleEmployeesExcludingEmployeeIds(List<Long> employeeIds);

	ResponseEntityDto deactivateUsers(DeactivateUsersRequestDto employeeIds);

	ResponseEntityDto updateUserLanguage(UpdateUserLanguageRequestDto requestDto);

	ResponseEntityDto getCurrentUserLanguage();

}
