package com.skapp.community.peopleplanner.model;

import tools.jackson.databind.JsonNode;
import com.skapp.community.common.util.converter.JsonTypeConverter;
import com.skapp.community.peopleplanner.type.BloodGroup;
import com.skapp.community.peopleplanner.type.Ethnicity;
import com.skapp.community.peopleplanner.type.MaritalStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "employee_personal_info")
public class EmployeePersonalInfo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "personal_info_id", nullable = false, updatable = false)
	private Long personalInfoId;

	@Column(name = "city")
	private String city;

	@Column(name = "state")
	private String state;

	@Column(name = "postal_code")
	private String postalCode;

	@Column(name = "birth_date")
	private LocalDate birthDate;

	@Column(name = "ethnicity")
	@Enumerated(EnumType.STRING)
	private Ethnicity ethnicity;

	@Column(name = "ssn")
	private String ssn;

	@Column(name = "previous_employment_details", columnDefinition = "json")
	@Convert(converter = JsonTypeConverter.class)
	private JsonNode previousEmploymentDetails;

	@Column(name = "nationality")
	private String nationality;

	@Column(name = "nin")
	private String nin;

	@Column(name = "passport_no")
	private String passportNo;

	@Column(name = "marital_status")
	@Enumerated(EnumType.STRING)
	private MaritalStatus maritalStatus;

	@Column(name = "social_media_details", columnDefinition = "json")
	@Convert(converter = JsonTypeConverter.class)
	private JsonNode socialMediaDetails;

	@Column(name = "blood_group")
	@Enumerated(EnumType.STRING)
	private BloodGroup bloodGroup;

	@Column(name = "extra_info", columnDefinition = "json")
	@Convert(converter = JsonTypeConverter.class)
	private JsonNode extraInfo;

	@OneToOne
	@MapsId
	@JoinColumn(name = "employee_id", updatable = false, unique = true)
	private Employee employee;

}
