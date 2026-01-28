package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "es_field_option")
public class FieldOption {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "option_value")
	private String optionValue;

	@Column(name = "display_order")
	private Integer displayOrder;

	@OneToOne(mappedBy = "fieldOption")
	private Field field;

}
