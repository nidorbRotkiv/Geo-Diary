package com.nidorbrotkiv.backend.marker;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MarkerRepository extends JpaRepository<Marker, Long> {

    @Query("SELECT m FROM Marker m LEFT JOIN m.viewers v WHERE m.user.email = :email")
    List<Marker> findByOwnerEmail(String email);

    @Query("SELECT m FROM Marker m WHERE m.user.email = :email")
    List<Marker> findOnlyOwnedMarkersByOwnerEmail(String email);

    @Query("SELECT m FROM Marker m LEFT JOIN m.viewers v WHERE v.user.email = :email")
    List<Marker> findByViewerEmail(String email);
}
