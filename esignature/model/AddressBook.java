package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.User;
import com.skapp.enterprise.esignature.type.UserType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "es_address_book")
public class AddressBook {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@OneToOne
	@JoinColumn(name = "internal_user_id")
	private User internalUser;

	@OneToOne
	@JoinColumn(name = "external_user_id")
	private ExternalUser externalUser;

	@Enumerated(EnumType.STRING)
	private UserType type;

	@Column(name = "is_active")
	private Boolean isActive = true;

	public Long getUserId() {
		if (type == UserType.EXTERNAL) {
			return externalUser.getId();
		}

		return internalUser.getUserId();
	}

	public String getName() {
		if (type == UserType.EXTERNAL) {
			return externalUser.getFirstName() + " " + externalUser.getLastName();
		}

		return internalUser.getEmployee().getFirstName() + " " + internalUser.getEmployee().getLastName();
	}

	public String getEmail() {
		if (type == UserType.EXTERNAL) {
			return externalUser.getEmail();
		}

		return internalUser.getEmail();
	}

}
