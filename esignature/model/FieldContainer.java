package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "es_field_container")
public class FieldContainer {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "font_family")
	private String fontFamily;

	@Column(name = "font_color")
	private String fontColor;

	@Column(name = "font_size")
	private Integer fontSize;

	@Column(name = "is_bold")
	private Boolean isBold;

	@Column(name = "is_italic")
	private Boolean isItalic;

	@Column(name = "is_underline")
	private Boolean isUnderline;

	@Column(name = "is_required")
	private Boolean isRequired;

	@Column(name = "is_multiselect")
	private Boolean isMultiSelect;

	@OneToMany(mappedBy = "fieldContainer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<Field> fields;

}
