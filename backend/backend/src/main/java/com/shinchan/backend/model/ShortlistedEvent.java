package com.shinchan.backend.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "shortlisted_events")
public class ShortlistedEvent {

    @EmbeddedId
    private Shortlist id;

    public ShortlistedEvent() {}

    public ShortlistedEvent(Shortlist id) {
        this.id = id;
    }

    public Shortlist getId() {
        return id;
    }

    public void setId(Shortlist id) {
        this.id = id;
    }
}
