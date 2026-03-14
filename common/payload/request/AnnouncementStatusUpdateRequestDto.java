package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.AnnouncementStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnouncementStatusUpdateRequestDto {

	@NotNull
	private AnnouncementStatus status;

}
