package com.skapp.enterprise.timeplanner.model;

import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.enterprise.timeplanner.type.RecordLocationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "time_record_location")
public class TimeRecordLocation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "time_record_id", nullable = false)
	private TimeRecord timeRecord;

	@Enumerated(EnumType.STRING)
	@Column(name = "clock_in_location_status")
	private RecordLocationStatus clockInLocationStatus;

	@Enumerated(EnumType.STRING)
	@Column(name = "clock_out_location_status")
	private RecordLocationStatus clockOutLocationStatus;

}
