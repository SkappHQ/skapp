package com.skapp.community.leaveplanner.util;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.util.Validation;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.constant.PolicyLeaveTypeConstant;
import com.skapp.community.leaveplanner.type.LeaveDuration;
import lombok.experimental.UtilityClass;

@UtilityClass
public class PolicyLeaveTypeValidationUtil {

	public static void validateName(String name) {
		if (name == null || name.isBlank()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_NAME_REQUIRED);
		}
		if (name.length() > PolicyLeaveTypeConstant.MAX_NAME_LENGTH) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_NAME_MAX_LENGTH_EXCEEDED);
		}
	}

	public static void validateEmojiCode(String emojiCode) {
		if (emojiCode == null || emojiCode.isBlank()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_EMOJI_CODE_REQUIRED);
		}
	}

	public static void validateColorCode(String colorCode) {
		if (colorCode == null || colorCode.isBlank()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_COLOR_CODE_REQUIRED);
		}
		if (!Validation.isValidThemeColor(colorCode)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_COLOR_CODE_INVALID);
		}
	}

	public static void validateMinDuration(LeaveDuration minDuration) {
		if (minDuration == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_MIN_DURATION_REQUIRED);
		}
	}

	public static void validateAttachmentSetup(Boolean isAttachment, Boolean isAttachmentMust) {
		if (!Boolean.TRUE.equals(isAttachment) && Boolean.TRUE.equals(isAttachmentMust)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_TYPE_UNABLE_TO_MAKE_ATTACHMENT_MANDATORY);
		}
	}

	public static void validatePagination(int page, int size) {
		if (page < PolicyLeaveTypeConstant.MIN_PAGE_NUMBER) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_INVALID_PAGE_NUMBER);
		}
		if (size < PolicyLeaveTypeConstant.MIN_PAGE_SIZE || size > PolicyLeaveTypeConstant.MAX_PAGE_SIZE) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_INVALID_PAGE_SIZE);
		}
	}

}
