package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmContactOwnerRepository;
import com.skapp.community.crmplanner.service.CrmContactOwnerReassignmentService;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmContactOwnerReassignmentServiceImpl implements CrmContactOwnerReassignmentService {

	private final CrmContactDao crmContactDao;

	private final CrmContactOwnerRepository crmContactOwnerRepository;

	@Override
	@Transactional
	public void reassignContactsOwnedByDeactivatedUsers(List<User> users) {
		List<Employee> deactivatedEmployees = users.stream().map(User::getEmployee).filter(employee -> employee != null)
			.toList();

		if (deactivatedEmployees.isEmpty()) {
			return;
		}

		List<CrmContact> contacts = crmContactDao.findByOwnerInAndIsDeletedFalse(deactivatedEmployees);
		if (contacts.isEmpty()) {
			return;
		}

		crmContactOwnerRepository.findFallbackAdminOwner().ifPresentOrElse(fallbackOwner -> {
			for (CrmContact contact : contacts) {
				contact.setOwner(fallbackOwner);
			}
			crmContactDao.saveAll(contacts);
		}, () -> log.error("reassignContactsOwnedByDeactivatedUsers: no active CRM admin owner found"));
	}

}
