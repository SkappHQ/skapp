package com.skapp.community.timeplanner.event;

import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.type.TimeRecordActionTypes;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class AttendanceClockEvent extends ApplicationEvent {

	private final Long employeeId;

	private final Long timeRecordId;

	private final TimeRecordActionTypes actionType;

	private final long eventTimeMillis;

	public AttendanceClockEvent(Object source, Long employeeId, Long timeRecordId, TimeRecordActionTypes actionType,
			long eventTimeMillis) {
		super(source);
		this.employeeId = employeeId;
		this.timeRecordId = timeRecordId;
		this.actionType = actionType;
		this.eventTimeMillis = eventTimeMillis;
	}

}
