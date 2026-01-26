package com.skapp.enterprise.common.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardNotificationCountDto {

	private Long pendingLeaveRequestsCount;

	private Long pendingTimeEntryRequestsCount;

	private Long pendingDocumentsToSignCount;

}
