package com.skapp.community.peopleplanner.event;

import org.springframework.context.ApplicationEvent;

public class GoogleWorkspaceConnectedEvent extends ApplicationEvent {

    private final String connectedByEmail;

    public GoogleWorkspaceConnectedEvent(Object source, String connectedByEmail) {
        super(source);
        this.connectedByEmail = connectedByEmail;
    }

    public String getConnectedByEmail() {
        return connectedByEmail;
    }
}
