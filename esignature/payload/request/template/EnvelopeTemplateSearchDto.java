package com.skapp.enterprise.esignature.payload.request.template;

import com.skapp.enterprise.esignature.type.TemplateEnvelopeSortKey;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EnvelopeTemplateSearchDto {

	private String searchKeyword;

	private TemplateEnvelopeSortKey sortKey = TemplateEnvelopeSortKey.NAME;

}
