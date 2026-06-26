package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ManagerResponseDto {

	private EmployeeBasicDetailsResponseDto manager;

	private Boolean isPrimaryManager;

	private ManagerType managerType;

}
