package com.skapp.community.timeplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.peopleplanner.model.Employee;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "time_record")
public class TimeRecord extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "time_record_id", updatable = false)
	private Long timeRecordId;

	@Column
	private LocalDate date;

	@Column(name = "day_of_week")
	@Enumerated(EnumType.STRING)
	private DayOfWeek day;

	@Column(name = "clock_in_time")
	private Long clockInTime;

	@Column(name = "clock_out_time")
	private Long clockOutTime;

	@Column(name = "is_manual")
	private boolean isManual;

	@Column(name = "is_completed")
	private boolean isCompleted;

	@Column(name = "worked_hours")
	private float workedHours;

	@Column(name = "break_hours")
	private float breakHours;

	@Column(name = "leave_hours")
	private float leaveHours;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "employee_id")
	private Employee employee;

	@OneToMany(mappedBy = "timeRecord", cascade = CascadeType.ALL)
	private List<TimeSlot> timeSlots;

}
