package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.type.EmployeeRemoveAction;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BulkReassignAndRemoveEmployeesRequestDto {

	private EmployeeRemoveAction action;

	private List<BulkReassignAndRemoveEmployeeItemDto> employees;

}
