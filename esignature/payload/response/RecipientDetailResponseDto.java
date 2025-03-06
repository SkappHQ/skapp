package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RecipientDetailResponseDto {

	private Long id;

	private String name;

	private String email;

	private MemberRole memberRole;

	private RecipientStatus status;

	private int signingOrder;

	private String color;

	private List<FieldDetailResponseDto> fields;

	private Long addressBookId;

}
