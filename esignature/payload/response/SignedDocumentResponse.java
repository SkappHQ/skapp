package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.model.DocumentVersion;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SignedDocumentResponse {

	private DocumentVersion documentVersion;

	private int numberOfPages;

}
