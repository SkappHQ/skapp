package com.skapp.enterprise.people.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DeactivateUsersRequestDto {

	private List<Long> employeeIds;

}
