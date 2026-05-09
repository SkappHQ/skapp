package com.skapp.community.timeplanner.event;

import com.skapp.community.timeplanner.type.TimeRecordActionTypes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AttendanceEventListener {

	@Async
	@EventListener
	public void handleAttendanceClockEvent(AttendanceClockEvent event) {
		log.info("handleAttendanceClockEvent: received {} event for employee: {}, timeRecord: {}",
				event.getActionType(), event.getEmployeeId(), event.getTimeRecordId());

		if (event.getActionType() == TimeRecordActionTypes.START) {
			processClockInEvent(event);
		}
		else if (event.getActionType() == TimeRecordActionTypes.END) {
			processClockOutEvent(event);
		}
	}

	private void processClockInEvent(AttendanceClockEvent event) {
		log.info("processClockInEvent: processing clock-in for employee: {} at time: {}", event.getEmployeeId(),
				event.getEventTimeMillis());
	}

	private void processClockOutEvent(AttendanceClockEvent event) {
		log.info("processClockOutEvent: processing clock-out for employee: {} at time: {}", event.getEmployeeId(),
				event.getEventTimeMillis());
	}

}
