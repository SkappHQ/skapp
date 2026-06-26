package com.skapp.community.timeplanner.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UpdateTimeRequestsFilterDto {

	@Schema(description = "Time request id")
	Long timeRequestId;

}
