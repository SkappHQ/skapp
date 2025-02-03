package com.skapp.enterprise.leaveplanner.model;

import com.skapp.community.leaveplanner.model.LeaveRequest;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
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

	@OneToOne
	@MapsId
	@JoinColumn(name = "leave_req_id")
	private LeaveRequest leaveRequest;

}
