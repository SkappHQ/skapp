package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "es_field_option_value")
public class FieldOptionValue extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "option_value")
	private String optionValue;

	@Column(name = "display_order")
	private int displayOrder;

	@OneToOne
	@JoinColumn(name = "field_id")
	private Field field;

}
