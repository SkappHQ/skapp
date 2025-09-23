package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.User;
import com.skapp.enterprise.esignature.type.MySignatureMethods;
import com.skapp.enterprise.esignature.type.UserType;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.CustomerContact;
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

	@OneToOne
	@JoinColumn(name = "customer_id")
	private Customer customer;

	@OneToOne
	@JoinColumn(name = "customer_contact_id")
	private CustomerContact customerContact;

	@Enumerated(EnumType.STRING)
	private UserType type;

	@Column(name = "is_active")
	private Boolean isActive = true;

	@Column(name = "my_signature_link")
	private String mySignatureLink;

	@Enumerated(EnumType.STRING)
	@Column(name = "my_signature_method")
	private MySignatureMethods mySignatureMethod;

	@Column(name = "font_family")
	private String fontFamily;

	@Column(name = "font_color")
	private String fontColor;

	public Long getUserId() {
		if (type == UserType.EXTERNAL) {
			return externalUser.getId();
		}
		else if (type == UserType.CUSTOMER) {
			return customerContact != null ? customerContact.getId() : customer.getId();
		}

		return internalUser.getUserId();
	}

	public String getName() {
		if (type == UserType.EXTERNAL) {
			return externalUser.getFirstName() + " " + externalUser.getLastName();
		}
		else if (type == UserType.CUSTOMER) {
			return customerContact != null ? customerContact.getName() : customer.getName();
		}

		return internalUser.getEmployee().getFirstName() + " " + internalUser.getEmployee().getLastName();
	}

	public String getFirstName() {
		if (type == UserType.EXTERNAL) {
			return externalUser.getFirstName();
		}
		else if (type == UserType.CUSTOMER) {
			return customerContact != null ? customerContact.getName() : customer.getName();
		}

		return internalUser.getEmployee().getFirstName();
	}

	public String getLastName() {
		if (type == UserType.EXTERNAL) {
			return externalUser.getLastName();
		}
		else if (type == UserType.CUSTOMER) {
			return customerContact != null ? customerContact.getName() : customer.getName();
		}

		return internalUser.getEmployee().getLastName();
	}

	public String getEmail() {
		if (type == UserType.EXTERNAL) {
			return externalUser.getEmail();
		}
		else if (type == UserType.CUSTOMER) {
			return customerContact != null ? customerContact.getEmail() : customer.getEmail();
		}

		return internalUser.getEmail();
	}

	public String getPhone() {
		if (type == UserType.EXTERNAL) {
			return externalUser.getPhone();
		}
		else if (type == UserType.CUSTOMER) {
			return customerContact != null ? customerContact.getContactNo() : null;
		}

		return internalUser.getEmployee().getPhone();
	}

}
