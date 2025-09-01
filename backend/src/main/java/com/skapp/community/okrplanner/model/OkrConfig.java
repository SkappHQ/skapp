package com.skapp.community.okrplanner.model;

import com.skapp.community.okrplanner.type.OkrFrequency;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "okr_config")
public class OkrConfig {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(name = "frequency", nullable = false)
	private OkrFrequency frequency;

}
