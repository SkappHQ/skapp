package com.skapp.community.timeplanner.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateIncompleteTimeRecordsRequestDto {

	@Schema(description = "Employee clock out time")
	private LocalDateTime clockOutTime;

}
