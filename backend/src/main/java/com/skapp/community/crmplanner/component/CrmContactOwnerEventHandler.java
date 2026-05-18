package com.skapp.community.crmplanner.component;

import com.skapp.community.common.util.event.UserDeactivatedEvent;
import com.skapp.community.common.util.event.UsersDeactivatedEvent;
import com.skapp.community.crmplanner.service.CrmContactOwnerReassignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CrmContactOwnerEventHandler {

	private final CrmContactOwnerReassignmentService crmContactOwnerReassignmentService;

	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
	public void handleUserDeactivation(UserDeactivatedEvent event) {
		try {
			crmContactOwnerReassignmentService.reassignContactsOwnedByDeactivatedUsers(List.of(event.getUser()));
		}
		catch (Exception e) {
			log.error("handleUserDeactivation: failed to reassign CRM contacts - {}", e.getMessage(), e);
		}
	}

	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
	public void handleUsersDeactivation(UsersDeactivatedEvent event) {
		try {
			crmContactOwnerReassignmentService.reassignContactsOwnedByDeactivatedUsers(event.getUsers());
		}
		catch (Exception e) {
			log.error("handleUsersDeactivation: failed to reassign CRM contacts - {}", e.getMessage(), e);
		}
	}

}
