package com.skapp.enterprise.esignature.model;

import com.skapp.enterprise.esignature.type.FieldStatus;
import com.skapp.enterprise.esignature.type.FieldType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
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

	@Column(name = "width_percentage")
	private float widthPercentage;

	@Column(name = "height_percentage")
	private float heightPercentage;

	@ManyToOne
	@JoinColumn(name = "document_id")
	private Document document;

	@ManyToOne
	@JoinColumn(name = "recipient_id", nullable = false)
	private Recipient recipient;

	@ManyToOne
	@JoinColumn(name = "field_container_id")
	private FieldContainer fieldContainer;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "field_option_id")
	private FieldOption fieldOption;

	@Column(name = "horizontal_padding")
	private float horizontalPadding;

	@Column(name = "vertical_padding")
	private float verticalPadding;

	@Column(name = "line_height")
	private float textLineHeight;

}
