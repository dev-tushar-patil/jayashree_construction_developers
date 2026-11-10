package com.jayashree.repository;

import com.jayashree.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

    @Query("select a from AdminUser a where lower(a.email) = lower(:login) or lower(a.username) = lower(:login)")
    Optional<AdminUser> findByLogin(@Param("login") String login);

    Optional<AdminUser> findByUsernameIgnoreCase(String username);
}
