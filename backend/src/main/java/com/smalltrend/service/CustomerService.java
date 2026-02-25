package com.smalltrend.service;

import java.util.List;
import java.util.stream.Collectors;
import com.smalltrend.dto.CustomerResponse;
import com.smalltrend.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {
    
    private final CustomerRepository customerRepository;

    public List<CustomerResponse> getAllCustomers(String phone) {
        List<CustomerResponse> customers = customerRepository.findAll().stream()
            .filter(customer -> {
                if (phone != null && !phone.isEmpty()) {
                    return customer.getPhone() != null && customer.getPhone().contains(phone);
                }
                return true;
            })
            .map(customer -> {
                CustomerResponse response = new CustomerResponse();
                response.setId(customer.getId());
                response.setName(customer.getName());
                response.setPhone(customer.getPhone());
                response.setLoyaltyPoints(customer.getLoyaltyPoints());
                return response;
            })
            .collect(Collectors.toList());
        return customers;
    }
    
}
