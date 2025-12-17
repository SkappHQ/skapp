package com.skapp.enterprise.people.payload.email;

import com.skapp.community.peopleplanner.payload.email.PeopleEmailDynamicFields;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GuestUserEmailDynamicFields extends PeopleEmailDynamicFields {

	private String projectNames;

	private String adminName;

}
