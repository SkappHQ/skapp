package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ReactivateTerminatedUserRequestDto {

	private String email;

}
