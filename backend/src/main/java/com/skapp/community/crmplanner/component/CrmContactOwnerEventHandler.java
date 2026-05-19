package com.skapp.community.crmplanner.component;

import com.skapp.community.common.model.User;
import com.skapp.community.common.util.event.UserDeactivatedEvent;
import com.skapp.community.common.util.event.UsersDeactivatedEvent;
import com.skapp.community.crmplanner.service.CrmContactOwnerReassignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CrmContactOwnerEventHandler {

	private final CrmContactOwnerReassignmentService crmContactOwnerReassignmentService;

	@EventListener
	public void handleUserDeactivation(UserDeactivatedEvent event) {
		try {
			crmContactOwnerReassignmentService.reassignContactsOwnedByDeactivatedUsers(List.of(event.getUser()));
		}
		catch (IllegalStateException e) {
			log.error("handleUserDeactivation: failed to reassign CRM contacts - {}", e.getMessage());
		}
	}

	@EventListener
	public void handleUsersDeactivation(UsersDeactivatedEvent event) {
		try {
			crmContactOwnerReassignmentService.reassignContactsOwnedByDeactivatedUsers(event.getUsers());
		}
		catch (IllegalStateException e) {
			log.error("handleUsersDeactivation: failed to reassign CRM contacts - {}", e.getMessage());
		}
	}

}
