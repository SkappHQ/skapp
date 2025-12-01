package com.skapp.enterprise.common.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EpGuestUserReInviteRequestDto {

	private String email;

	private List<String> projectNames;

}
