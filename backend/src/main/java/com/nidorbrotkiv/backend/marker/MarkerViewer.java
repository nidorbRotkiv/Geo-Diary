package com.nidorbrotkiv.backend.marker;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.nidorbrotkiv.backend.user.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "marker_viewer")
public class MarkerViewer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "marker_id", referencedColumnName = "id")
    @JsonBackReference("marker-viewer")
    private Marker marker;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
