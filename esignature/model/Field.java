package com.skapp.enterprise.esignature.model;

import com.skapp.enterprise.esignature.type.FieldStatus;
import com.skapp.enterprise.esignature.type.FieldType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "es_field")
public class Field {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "field_id", nullable = false, updatable = false)
	private Long id;

	@Enumerated(EnumType.STRING)
	private FieldType type;

	@Enumerated(EnumType.STRING)
	private FieldStatus status;

	@Column(name = "page_number")
	private int pageNumber;

	@Column(name = "x_position")
	private float xPosition;

	@Column(name = "y_position")
	private float yPosition;

	@Column(name = "width")
	private float width;

	@Column(name = "height")
	private float height;

	@ManyToOne
	@JoinColumn(name = "document_id")
	private Document document;

	@ManyToOne
	@JoinColumn(name = "recipient_id", nullable = false)
	private Recipient recipient;

	@ManyToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "field_container_id")
	private FieldContainer fieldContainer;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "field_option_id")
	private FieldOption fieldOption;

}
