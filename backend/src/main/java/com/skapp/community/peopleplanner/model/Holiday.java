package com.skapp.community.peopleplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.peopleplanner.type.HolidayDuration;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "holiday")
public class Holiday extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@Column(name = "date", nullable = false)
	private LocalDate date;

	@Column(name = "name", length = 50, nullable = false)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(name = "holiday_duration", nullable = false, length = 15, columnDefinition = "varchar(255)")
	private HolidayDuration holidayDuration;

	@Column(name = "is_active")
	private boolean isActive = true;

	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(name = "shr_com_work_location_ppl_holiday", joinColumns = @JoinColumn(name = "holiday_id"),
			inverseJoinColumns = @JoinColumn(name = "work_location_id"))
	private Set<WorkLocation> workLocations = new HashSet<>();

}
