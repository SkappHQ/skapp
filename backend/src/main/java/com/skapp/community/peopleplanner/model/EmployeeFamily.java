package com.skapp.community.peopleplanner.model;

import com.skapp.community.peopleplanner.type.Gender;
import com.skapp.community.peopleplanner.type.RelationshipTypes;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "employee_family")
public class EmployeeFamily {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "family_id", nullable = false, updatable = false)
	private Long familyId;

	@Column(name = "first_name")
	private String firstName;

	@Column(name = "last_name")
	private String lastName;

	@Enumerated(EnumType.STRING)
	@Column(name = "gender", columnDefinition = "varchar(255)")
	private Gender gender;

	@Column(name = "birth_date")
	private LocalDate birthDate;

	@Column(name = "relationship", columnDefinition = "varchar(255)")
	@Enumerated(EnumType.STRING)
	private RelationshipTypes familyRelationship;

	@Column(name = "parent_name")
	private String parentName;

	@ManyToOne(optional = false)
	@JoinColumn(name = "employee_id")
	private Employee employee;

}
