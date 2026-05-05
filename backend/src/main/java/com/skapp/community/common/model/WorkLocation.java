package com.skapp.community.common.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "work_location")
public class WorkLocation extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "work_location_id", nullable = false, updatable = false)
	private Long workLocationId;

	@Column(name = "name", nullable = false, unique = true)
	private String name;

	@Column(name = "address")
	private String address;

}
