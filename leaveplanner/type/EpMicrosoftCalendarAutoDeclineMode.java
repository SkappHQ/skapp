package com.skapp.enterprise.leaveplanner.type;

import lombok.Getter;

@Getter
public enum EpMicrosoftCalendarAutoDeclineMode {

	DECLINE_NONE("declineNone"), DECLINE_ALL_CONFLICTING_INVITATION("declineAllConflictingInvitations"),
	DECLINE_ONLY_NEW_CONFLICTING_INVITATIONS("declineOnlyNewConflictingInvitations");

	private final String autoDeclineMode;

	EpMicrosoftCalendarAutoDeclineMode(String autoDeclineMode) {
		this.autoDeclineMode = autoDeclineMode;
	}

}
