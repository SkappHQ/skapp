package com.skapp.community.common.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReInvitationRequestDto {

	private List<Long> ids;

}
