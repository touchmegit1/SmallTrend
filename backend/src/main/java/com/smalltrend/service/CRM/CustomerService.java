package com.smalltrend.service.CRM;

import java.util.List;

import com.smalltrend.dto.CRM.CustomerResponse;
import com.smalltrend.entity.Customer;
import com.smalltrend.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    private static final long LOYALTY_RATE = 10000L; // 10000 VNĐ = 1 điểm loyalty

    public List<CustomerResponse> getAllCustomers() {
        List<CustomerResponse> customers = customerRepository.findAll().stream()
            .map(this::mapToResponse).toList();
        return customers;
    }

    public CustomerResponse getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found"));
        return mapToResponse(customer);
    }

    public CustomerResponse createCustomer(String name, String phone) {
        Customer customer = Customer.builder()
            .name(name)
            .phone(phone)
            .spentAmount(0L)
            .build();
        Customer savedCustomer = customerRepository.save(customer);
        return mapToResponse(savedCustomer);
    }

    public CustomerResponse updateCustomer(Integer id, String name, String phone) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        customer.setName(name);
        customer.setPhone(phone);
        
        Customer updatedCustomer = customerRepository.save(customer);
        return mapToResponse(updatedCustomer);
    }

    public void deleteCustomer(Integer id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found");
        }
        customerRepository.deleteById(id);
    }

    private CustomerResponse mapToResponse(Customer customer) {
        CustomerResponse response = new CustomerResponse();
        response.setId(customer.getId());
        response.setName(customer.getName());
        response.setPhone(customer.getPhone());
        response.setLoyaltyPoints(0);
        
        return response;
    }
}
