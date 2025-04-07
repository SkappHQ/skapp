package com.skapp.enterprise.esignature.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemporaryLinkResponseDto {

	private String token;

	private String url;

	private LocalDateTime expiresAt;

	private int maxClicks;

	private Integer clickCount;

}
