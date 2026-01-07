package com.skapp.enterprise.pm.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ReleaseIconEnum {

	BUG_ICON("bug.png"), TASK_ICON("task.png"), EDU_ICON("story.png"), STAR_ICON("epic.png"),
	SUBTASK_ICON("subtask.png"), SKAPP_ICON("skapp.png"), APPROVED_ICON("approved.png");

	private final String fileName;

	public static String getFileNameByType(String iconType) {
		if (iconType == null) {
			return TASK_ICON.fileName;
		}

		try {
			return ReleaseIconEnum.valueOf(iconType.toUpperCase()).fileName;
		}
		catch (IllegalArgumentException e) {
			return TASK_ICON.fileName;
		}
	}

}
