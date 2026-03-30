package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.AnnouncementInteractionType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnouncementInteractRequestDto {

	@NotNull
	private AnnouncementInteractionType type;

}
