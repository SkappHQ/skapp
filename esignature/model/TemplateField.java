package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
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
@Table(name = "es_template_field")
public class TemplateField extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Enumerated(EnumType.STRING)
	private FieldType type;

	@Column(name = "page_number")
	private int pageNumber;

	@Column(name = "x_position")
	private Float xPosition;

	@Column(name = "y_position")
	private Float yPosition;

	@Column(name = "width")
	private Float width;

	@Column(name = "height")
	private Float height;

	@Column(name = "width_percentage")
	private float widthPercentage;

	@Column(name = "height_percentage")
	private float heightPercentage;

	@ManyToOne
	@JoinColumn(name = "template_document_id")
	private TemplateDocument templateDocument;

	@ManyToOne
	@JoinColumn(name = "template_recipient_id", nullable = false)
	private TemplateRecipient templateRecipient;

	@ManyToOne
	@JoinColumn(name = "template_field_container_id")
	private TemplateFieldContainer templateFieldContainer;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "template_field_option_id")
	private TemplateFieldOption templateFieldOption;

}
