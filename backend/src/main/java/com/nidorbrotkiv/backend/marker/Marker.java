package com.nidorbrotkiv.backend.marker;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.nidorbrotkiv.backend.user.User;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "marker")
public class Marker {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Double latitude;
    private Double longitude;
    private String title;
    private String description;
    private Boolean isPublic = true;
    private String category;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "marker", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("marker-image")
    private List<Image> images = new ArrayList<>();

    @OneToMany(mappedBy = "marker", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("marker-viewer")
    private Set<MarkerViewer> viewers = new HashSet<>();

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "weather_info_id", referencedColumnName = "id")
    @JsonManagedReference("marker-weather")
    private WeatherInfo weatherInfo;

    public void removeViewer(User user) {
        viewers.removeIf(viewer -> viewer.getUser().equals(user));
    }
}
