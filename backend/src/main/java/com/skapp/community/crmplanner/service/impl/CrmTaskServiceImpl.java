package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.payload.request.CrmTaskEditRequestDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskResponseDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.repository.CrmTaskTypeDao;
import com.skapp.community.crmplanner.service.CrmTaskService;
import com.skapp.community.crmplanner.util.CrmOwnerUtils;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmTaskServiceImpl implements CrmTaskService {

	private final CrmTaskDao crmTaskDao;

	private final CrmTaskTypeDao crmTaskTypeDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmOwnerUtils crmOwnerUtils;

	private final CrmMapper crmMapper;

	private final UserService userService;

	@Override
	@Transactional
	public ResponseEntityDto editTask(Long id, CrmTaskEditRequestDto requestDto) {
		log.info("editTask: execution started");

		CrmTask task = crmTaskDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_NOT_FOUND));

		User currentUser = userService.getCurrentUser();
		Role currentCrmRole = currentUser.getEmployee().getEmployeeRole().getCrmRole();

		if (currentCrmRole == Role.CRM_SALES_REPRESENTATIVE
				&& !task.getOwner().getEmployeeId().equals(currentUser.getEmployee().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_EDIT_DENIED);
		}

		if (requestDto.getName() != null) {
			CrmValidations.validateTaskName(requestDto.getName());
			task.setName(requestDto.getName());
		}

		if (requestDto.getTypeId() != null) {
			CrmValidations.validateTaskTypeId(requestDto.getTypeId());
			CrmTaskType taskType = crmTaskTypeDao.findById(requestDto.getTypeId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_TYPE_NOT_FOUND));
			task.setType(taskType);
		}

		if (requestDto.getPriority() != null) {
			task.setPriority(requestDto.getPriority());
		}

		if (requestDto.getIsCompleted() != null) {
			task.setIsCompleted(requestDto.getIsCompleted());
		}

		if (requestDto.getDueAt() != null) {
			task.setDueAt(requestDto.getDueAt());
		}

		if (requestDto.getNotes() != null) {
			CrmValidations.validateTaskNotes(requestDto.getNotes());
			task.setNotes(requestDto.getNotes());
		}

		if (requestDto.getOwnerId() != null) {
			CrmValidations.validateOwnerId(requestDto.getOwnerId());
			Employee owner = crmOwnerUtils.resolveOwner(requestDto.getOwnerId(), currentUser);
			task.setOwner(owner);
		}

		if (requestDto.getContactId() != null) {
			CrmValidations.validateContactId(requestDto.getContactId());
			CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(requestDto.getContactId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));
			task.setContact(contact);
		}

		if (requestDto.getCompanyId() != null) {
			CrmValidations.validateCompanyId(requestDto.getCompanyId());
			CrmCompany company = crmCompanyDao.findByIdAndIsDeletedFalse(requestDto.getCompanyId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND));
			task.setCompany(company);
		}

		if (requestDto.getDealId() != null) {
			CrmValidations.validateDealId(requestDto.getDealId());
			CrmDeal deal = crmDealDao.findByIdAndIsDeletedFalse(requestDto.getDealId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));
			task.setDeal(deal);
		}

		CrmTask updatedTask = crmTaskDao.save(task);
		CrmTaskResponseDto responseDto = crmMapper.crmTaskToCrmTaskResponseDto(updatedTask);

		log.info("editTask: execution ended successfully");
		return new ResponseEntityDto(false, responseDto);
	}

}
