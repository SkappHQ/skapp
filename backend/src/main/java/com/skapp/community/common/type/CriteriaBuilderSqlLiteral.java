package com.skapp.community.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CriteriaBuilderSqlLiteral {

	DASH(" - "), COMMA(","), SPACE(" "), SEMICOLON(";"), UNDERSCORE("_"), EMPTY(""), LEFT_PARENTHESIS("("),
	RIGHT_PARENTHESIS(")"), PERCENT("%"), ASTERISK("*"), DASHED_DATE_PATTERN("%d/%m/%Y"),
	SPACE_DATE_PATTERN("%D %b %Y");

	private final String value;

}
