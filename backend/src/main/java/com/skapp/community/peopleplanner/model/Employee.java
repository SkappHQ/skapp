package com.skapp.community.peopleplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.common.model.Notification;
import com.skapp.community.common.model.User;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EEO;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.peopleplanner.type.EmploymentType;
import com.skapp.community.peopleplanner.type.Gender;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "employee")
public class Employee extends Auditable<String> {

	@Id
	@Column(name = "employee_id", nullable = false, unique = true, updatable = false)
	private Long employeeId;

	@OneToOne
	@MapsId
	@JoinColumn(name = "employee_id")
	private User user;

	@Column(name = "first_name", length = 50)
	private String firstName;

	@Column(name = "last_name", length = 50)
	private String lastName;

	@Enumerated(EnumType.STRING)
	@Column(name = "gender", length = 10, columnDefinition = "varchar(20)")
	private Gender gender;

	@Column(name = "middle_name")
	private String middleName;

	@Column(name = "designation")
	private String designation;

	@Column(name = "auth_pic", length = 500)
	private String authPic;

	@Column(name = "country")
	private String country;

	@Column(name = "address")
	private String addressLine1;

	@Column(name = "personal_email")
	private String personalEmail;

	@Column(name = "phone", length = 15)
	private String phone;

	@Column(name = "identification_no", length = 15)
	private String identificationNo;

	@Column(name = "time_zone")
	private String timeZone;

	@Column(name = "join_date")
	private LocalDate joinDate;

	@Column(name = "address_line_2")
	private String addressLine2;

	@Column(name = "work_hour_capacity")
	private Integer workHourCapacity;

	@Enumerated(EnumType.STRING)
	@Column(name = "employee_type", columnDefinition = "varchar(255)")
	private EmploymentType employmentType;

	@Column(name = "account_status", nullable = false, columnDefinition = "varchar(20)")
	@Enumerated(EnumType.STRING)
	private AccountStatus accountStatus;

	@Column(name = "employment_allocation", columnDefinition = "varchar(255)")
	@Enumerated(EnumType.STRING)
	private EmploymentAllocation employmentAllocation;

	@Column(name = "last_clock_in_date")
	private LocalDate lastClockInDate;

	@Enumerated(EnumType.STRING)
	@Column(name = "eeo", columnDefinition = "varchar(255)")
	private EEO eeo;

	@Column(name = "termination_date")
	private LocalDate terminationDate;

	@OneToOne(mappedBy = "employee", cascade = CascadeType.ALL)
	@PrimaryKeyJoinColumn
	private EmployeeRole employeeRole;

	@OneToOne(mappedBy = "employee", cascade = CascadeType.ALL)
	@PrimaryKeyJoinColumn
	private EmployeePersonalInfo personalInfo;

	@OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
	private Set<EmployeeTeam> employeeTeams;

	@OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
	private List<EmployeeEducation> employeeEducations;

	@OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
	private List<EmployeeProgression> employeeProgressions;

	@OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
	private List<EmployeeVisa> employeeVisas;

	@OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
	private List<EmployeeFamily> employeeFamilies;

	@OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
	private List<EmployeeEmergency> employeeEmergencies;

	@OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<EmployeeManager> employeeManagers;

	@OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
	private Set<EmployeePeriod> employeePeriods;

	@OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
	private List<Notification> notifications = new ArrayList<>();

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "job_family_id")
	private JobFamily jobFamily;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "job_title_id")
	private JobTitle jobTitle;

	public String getFullName() {
		return firstName + " " + lastName;
	}

}
