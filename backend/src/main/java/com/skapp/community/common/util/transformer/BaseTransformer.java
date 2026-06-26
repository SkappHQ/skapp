package com.skapp.community.common.util.transformer;

public interface BaseTransformer<T, I> {

	I transform(T type);

}
