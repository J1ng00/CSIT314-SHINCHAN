package com.shinchan.backend.model;

import java.util.Objects;

public class ShortlistedEventDTO {

    private Shortlist id;
    private Event event;

    public ShortlistedEventDTO(Shortlist id, Event event) {
        this.id = id;
        this.event = event;
    }

    public Shortlist getId() {
        return id;
    }

    public void setId(Shortlist id) {
        this.id = id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ShortlistedEventDTO)) return false;
        ShortlistedEventDTO that = (ShortlistedEventDTO) o;
        return Objects.equals(id.getUserEmail(), that.id.getUserEmail()) &&
               Objects.equals(id.getEventId(), that.id.getEventId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(id.getUserEmail(), id.getEventId());
    }
}
