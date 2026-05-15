package com.turf.turf.dto;

public class TurfDTO {

    private Long id;
    private String name;
    private String location;
    private Double pricePerHour;
    private String ownerUsername;

    public TurfDTO(Long id,
                   String name,
                   String location,
                   Double pricePerHour,
                   String ownerUsername) {

        this.id = id;
        this.name = name;
        this.location = location;
        this.pricePerHour = pricePerHour;
        this.ownerUsername = ownerUsername;
    }

    public Long getId() { return id; }

    public String getName() { return name; }

    public String getLocation() { return location; }

    public Double getPricePerHour() { return pricePerHour; }

    public String getOwnerUsername() { return ownerUsername; }
}