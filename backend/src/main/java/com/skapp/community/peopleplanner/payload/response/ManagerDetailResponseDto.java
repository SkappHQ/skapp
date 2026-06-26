package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.leaveplanner.type.ManagerType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ManagerDetailResponseDto {

	private ManagerCoreDetailsDto manager;

	private Boolean isPrimaryManager;

	private ManagerType managerType;

}
