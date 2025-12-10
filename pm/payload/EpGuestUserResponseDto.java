package com.skapp.enterprise.pm.payload;

import com.skapp.enterprise.common.payload.request.ProjectRequestDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EpGuestUserResponseDto extends EpUserResponseDto {

	private List<ProjectRequestDto> projects;

}
