package com.nidorbrotkiv.backend.marker;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class WeatherInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Double temp;
    private Long dt;
    private String location;
    private String icon;
    private String country;
    private String description;

    @OneToOne(mappedBy = "weatherInfo")
    @JsonBackReference("marker-weather")
    private Marker marker;
}
