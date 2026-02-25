package com.smalltrend.service.CRM;

import java.util.List;

import com.smalltrend.dto.CRM.CustomerResponse;
import com.smalltrend.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {
    
    private final CustomerRepository customerRepository;

    public List<CustomerResponse> getAllCustomers() {
        List<CustomerResponse> customers = customerRepository.findAll().stream().map(customer -> {
            CustomerResponse response = new CustomerResponse();
            response.setId(customer.getId());
            response.setName(customer.getName());
            response.setPhone(customer.getPhone());
            response.setLoyaltyPoints(customer.getLoyaltyPoints());
            return response;
        }).toList();
        return customers;
    }
    
}
