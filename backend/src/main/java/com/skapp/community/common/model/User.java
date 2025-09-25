package com.skapp.community.common.model;

import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.peopleplanner.model.Employee;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "\"user\"")
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_id", nullable = false, updatable = false)
	private Long userId;

	@Column(name = "email", nullable = false, unique = true)
	private String email;

	@Column(name = "password")
	private String password;

	@Column(name = "temp_password")
	private String tempPassword;

	@Enumerated(EnumType.STRING)
	@Column(name = "login_method", columnDefinition = "varchar(255)")
	private LoginMethod loginMethod;

	@Column(name = "is_active", nullable = false)
	private Boolean isActive = true;

	@Column(name = "is_password_changed")
	private Boolean isPasswordChangedForTheFirstTime = false;

	@Column(name = "previous_passwords")
	private String previousPasswords;

	@Column(name = "lang")
	private String lang;

	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
	@PrimaryKeyJoinColumn
	private Employee employee;

	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
	@PrimaryKeyJoinColumn
	private UserSettings settings;

	public List<String> getPreviousPasswordsList() {
		if (previousPasswords == null || previousPasswords.isEmpty()) {
			return new ArrayList<>();
		}
		return new ArrayList<>(List.of(previousPasswords.split(",")));
	}

	public void addPreviousPassword(String password) {
		List<String> previousPasswordList = getPreviousPasswordsList();

		previousPasswordList.add(password);
		this.previousPasswords = String.join(",", previousPasswordList);
	}

}
