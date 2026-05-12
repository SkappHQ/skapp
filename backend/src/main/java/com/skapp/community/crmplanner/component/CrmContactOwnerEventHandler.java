package com.skapp.community.crmplanner.component;

import com.skapp.community.common.model.User;
import com.skapp.community.common.util.event.UserDeactivatedEvent;
import com.skapp.community.common.util.event.UsersDeactivatedEvent;
import com.skapp.community.crmplanner.service.CrmContactOwnerReassignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CrmContactOwnerEventHandler {

	private final CrmContactOwnerReassignmentService crmContactOwnerReassignmentService;

	@EventListener
	public void handleUserDeactivation(UserDeactivatedEvent event) {
		crmContactOwnerReassignmentService.reassignContactsOwnedByDeactivatedUsers(List.of(event.getUser()));
	}

	@EventListener
	public void handleUsersDeactivation(UsersDeactivatedEvent event) {
		crmContactOwnerReassignmentService.reassignContactsOwnedByDeactivatedUsers(event.getUsers());
	}

}
