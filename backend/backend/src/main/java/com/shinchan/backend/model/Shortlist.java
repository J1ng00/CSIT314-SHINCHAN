package com.shinchan.backend.model;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class Shortlist implements Serializable {

    private String userEmail;
    private Long eventId;

    public Shortlist() {}

    public Shortlist(String userEmail, Long eventId) {
        this.userEmail = userEmail;
        this.eventId = eventId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Shortlist)) return false;
        Shortlist that = (Shortlist) o;
        return Objects.equals(userEmail, that.userEmail) &&
               Objects.equals(eventId, that.eventId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userEmail, eventId);
    }
}
