package com.skapp.community.timeplanner.model;

import com.skapp.community.timeplanner.type.SlotType;
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
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "time_slot")
public class TimeSlot {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "time_slot_id", updatable = false)
	private Long timeSlotId;

	@Column(name = "start_time")
	private Long startTime;

	@Column(name = "end_time")
	private Long endTime;

	@Column(name = "type", columnDefinition = "varchar(255)")
	@Enumerated(EnumType.STRING)
	private SlotType slotType;

	@Column(name = "is_active_now")
	private boolean isActiveRightNow;

	@Column(name = "is_manual")
	private boolean isManualEntry;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "time_record_id")
	private TimeRecord timeRecord;

}
