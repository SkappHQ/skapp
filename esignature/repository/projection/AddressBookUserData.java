package com.skapp.enterprise.esignature.repository.projection;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressBookUserData {

	private Long addressBookId;

	private Long userId;

	private String email;

	private String userType;

	private String firstName;

	private String lastName;

	private String authPic;

	private String phone;

	public AddressBookUserData(Long addressBookId, Long userId, String email, String userType, String firstName,
			String lastName, String authPic, String phone) {
		this.addressBookId = addressBookId;
		this.userId = userId;
		this.email = email;
		this.userType = userType;
		this.firstName = firstName;
		this.lastName = lastName;
		this.authPic = authPic;
		this.phone = phone;
	}

}
