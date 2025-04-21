package com.skapp.enterprise.esignature.repository.projection;

import com.skapp.community.common.type.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressBookSenderData {

	private Long addressBookId;

	private Long userId;

	private String email;

	private String firstName;

	private String lastName;

	private Role userRole;

	private String phone;

	private String authPic;

	public AddressBookSenderData(Long addressBookId, Long userId, String email, String firstName, String lastName,
			String phone, Role userRole, String authPic) {
		this.addressBookId = addressBookId;
		this.userId = userId;
		this.email = email;
		this.firstName = firstName;
		this.lastName = lastName;
		this.phone = phone;
		this.userRole = userRole;
		this.authPic = authPic;
	}

}
