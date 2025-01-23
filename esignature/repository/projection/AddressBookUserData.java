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

	public AddressBookUserData(Long addressBookId, Long userId, String email, String userType, String firstName,
			String lastName, String authPic) {
		this.addressBookId = addressBookId;
		this.userId = userId;
		this.email = email;
		this.userType = userType;
		this.firstName = firstName;
		this.lastName = lastName;
		this.authPic = authPic;
	}

}
