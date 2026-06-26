package com.skapp.community.leaveplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GenericLeaveResponse<K, T> {

	private K genericFirst;

	private T genericSecond;

	public GenericLeaveResponse(K genericFirst, T genericSecond) {
		this.genericFirst = genericFirst;
		this.genericSecond = genericSecond;
	}

}
