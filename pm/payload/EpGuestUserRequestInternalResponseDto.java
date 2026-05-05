package com.skapp.enterprise.pm.payload;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class EpGuestUserRequestInternalResponseDto {

	private Long requestId;

	private String email;

	private List<Long> projectIds;

	private LocalDateTime requestedDate;

}
