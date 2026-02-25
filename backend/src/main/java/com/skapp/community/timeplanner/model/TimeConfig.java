package com.skapp.community.timeplanner.model;

import com.skapp.community.common.util.converter.JsonTypeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import tools.jackson.databind.JsonNode;

import java.time.DayOfWeek;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "time_config")
public class TimeConfig {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, unique = true, updatable = false)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(name = "day_of_week", nullable = false)
	private DayOfWeek day;

	@Column(name = "time_blocks", columnDefinition = "json")
	@Convert(converter = JsonTypeConverter.class)
	private JsonNode timeBlocks;

	@Column(name = "total_hours", precision = 3, nullable = false)
	private Float totalHours;

	@Column(name = "is_week_start_day", nullable = false)
	private Boolean isWeekStartDay;

	@Column(name = "start_hour")
	@Min(value = 0)
	@Max(value = 23)
	private Integer startHour;

	@Column(name = "start_minute")
	@Min(value = 0)
	@Max(value = 59)
	private Integer startMinute;

}
