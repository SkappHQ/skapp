package com.skapp.community.common.type;

import java.util.concurrent.TimeUnit;

public interface CacheKey {

	String getKey();

	long getTtl();

	TimeUnit getTimeUnit();

	String format(Object... values);

}
