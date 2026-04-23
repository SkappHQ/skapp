package com.skapp.enterprise.pm.payload;

import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import com.skapp.enterprise.common.payload.request.ProjectRequestDto;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class EpGuestUserRequestResponseDto {

	private Long requestId;

	private String email;

	private List<ProjectRequestDto> projects;

	private LocalDateTime requestedDate;

	private EmployeeBasicDetailsResponseDto requestedBy;

}
