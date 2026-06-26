package com.skapp.community.timeplanner.payload.request;

import com.skapp.community.peopleplanner.type.RequestStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TimeRequestManagerPatchDto {

	@Schema(description = "Updating status")
	private RequestStatus status;

}
