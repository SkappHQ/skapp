package com.skapp.enterprise.esignature.payload.request.template;

import com.skapp.enterprise.esignature.type.MemberRole;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RecipientTemplateDto {

	private String recipientRole;

	private MemberRole memberRole;

	private Integer signingOrder;

	private String color;

	private Long addressBookId;

	private List<FieldTemplateDto> templateFields;

}
