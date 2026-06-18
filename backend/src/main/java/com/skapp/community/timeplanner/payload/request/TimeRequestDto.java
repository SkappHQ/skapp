package com.skapp.community.timeplanner.payload.request;

import com.skapp.community.peopleplanner.type.RequestType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TimeRequestDto {

	@Schema(description = "Work started time.")
	private LocalDateTime startTime;

	@Schema(description = "Work ended time.")
	private LocalDateTime endTime;

	@Schema(description = "Time request type", example = "MANUAL_ENTRY_REQUEST")
	private RequestType requestType;

	@Schema(description = "Time request record id")
	private Long recordId;

	@Schema(description = "Time zone id")
	private String zoneId;

}
