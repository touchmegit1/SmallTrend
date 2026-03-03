package com.smalltrend.repository;

import com.smalltrend.entity.Ticket;
import com.smalltrend.entity.enums.TicketStatus;
import com.smalltrend.entity.enums.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByTicketType(TicketType ticketType);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByCreatedById(Integer userId);

    List<Ticket> findByAssignedToId(Integer userId);

    List<Ticket> findByTicketCode(String ticketCode);

    long countByTicketType(TicketType ticketType);
}
