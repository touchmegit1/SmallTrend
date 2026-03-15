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
        String cleanPhone = phone != null ? phone.replaceAll("\\s+", "") : "";
        if (customerRepository.findByPhoneIgnoreSpaces(cleanPhone).isPresent()) {
            throw new RuntimeException("Số điện thoại này đã được sử dụng cho một khách hàng khác.");
        }

        Customer customer = Customer.builder()
                .name(name)
                .phone(cleanPhone)
                .build();
        Customer savedCustomer = customerRepository.save(customer);
        return mapToResponse(savedCustomer);
    }

    public CustomerResponse updateCustomer(Integer id, String name, String phone, Integer loyaltyPoints) {
        return updateCustomer(id, name, phone, loyaltyPoints, null);
    }

    public CustomerResponse updateCustomer(Integer id, String name, String phone, Integer loyaltyPoints, Long spentAmount) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (phone != null && !phone.equals(customer.getPhone())) {
            String cleanPhone = phone.replaceAll("\\s+", "");
            customerRepository.findByPhoneIgnoreSpaces(cleanPhone).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new RuntimeException("Số điện thoại này đã được sử dụng cho một khách hàng khác.");
                }
            });
            customer.setPhone(cleanPhone);
        }

        customer.setName(name);

        if (loyaltyPoints != null) {
            customer.setLoyaltyPoints(loyaltyPoints);
        }
        if (spentAmount != null) {
            customer.setSpentAmount(spentAmount);
        }

        Customer updatedCustomer = customerRepository.save(customer);
        return mapToResponse(updatedCustomer);
    }

    public void deleteCustomer(Integer id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found");
        }
        customerRepository.deleteById(id);
    }

    public CustomerResponse getCustomerByPhone(String phone) {
        String cleanPhone = phone != null ? phone.replaceAll("\\s+", "") : "";
        Customer customer = customerRepository.findByPhoneIgnoreSpaces(cleanPhone)
                .orElseThrow(() -> new RuntimeException("Customer not found with phone: " + phone));
        return mapToResponse(customer);
    }

    private CustomerResponse mapToResponse(Customer customer) {
        CustomerResponse response = new CustomerResponse();
        response.setId(customer.getId());
        response.setName(customer.getName());
        response.setPhone(customer.getPhone());
        response.setLoyaltyPoints(customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0);
        response.setSpentAmount(customer.getSpentAmount() != null ? customer.getSpentAmount() : 0L);
        return response;
    }
}
