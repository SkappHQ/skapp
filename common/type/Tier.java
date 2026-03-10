package com.skapp.enterprise.common.type;

import java.util.Arrays;
import java.util.List;

public enum Tier {

	FREE, CORE, PRO;

	public List<Tier> getTiersHirachy() {
		return Arrays.stream(Tier.values()).filter(t -> t.ordinal() <= this.ordinal()).toList();
	}

}