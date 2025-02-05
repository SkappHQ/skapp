package com.skapp.enterprise.leaveplanner.model;

import com.skapp.community.leaveplanner.model.LeaveRequest;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@Setter
@Getter
@Table(name = "calendar_event")
public class CalendarEvent {

	@Id
	@Column(name = "event_id")
	private String eventId;

	@ManyToOne
	@JoinColumn(name = "leave_req_id")
	private LeaveRequest leaveRequest;

}
