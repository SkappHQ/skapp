package com.skapp.community.leaveplanner.service;

import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;

public interface PolicyLeaveReviewNotificationService {

	void sendApprovedPolicyLeaveRequestNotifications(PolicyLeaveRequest leaveRequest);

	void sendDeclinedPolicyLeaveRequestNotifications(PolicyLeaveRequest leaveRequest);

	void sendRevokedPolicyLeaveRequestNotifications(PolicyLeaveRequest leaveRequest);

	void sendCancelledPolicyLeaveRequestNotifications(PolicyLeaveRequest leaveRequest);

	void sendNudgePolicyLeaveRequestManagerNotifications(PolicyLeaveRequest leaveRequest);

}
