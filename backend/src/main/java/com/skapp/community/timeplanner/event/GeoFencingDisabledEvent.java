package com.skapp.community.timeplanner.event;

import org.springframework.context.ApplicationEvent;

public class GeoFencingDisabledEvent extends ApplicationEvent {

	public GeoFencingDisabledEvent(Object source) {
		super(source);
	}

}
