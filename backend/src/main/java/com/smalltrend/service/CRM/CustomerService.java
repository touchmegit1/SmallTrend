package com.smalltrend.service.CRM;

import java.util.List;

import com.smalltrend.dto.CRM.CustomerResponse;
import com.smalltrend.entity.Customer;
import com.smalltrend.exception.CrmException;
import com.smalltrend.repository.CustomerRepository;
import com.smalltrend.validation.CustomerValidator;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerValidator customerValidator;

    private static final long LOYALTY_RATE = 10000L; // 10000 VNĐ = 1 điểm loyalty

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CustomerResponse getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> CrmException.customerNotFound(id));
        return mapToResponse(customer);
    }

    public CustomerResponse createCustomer(String name, String phone) {
        customerValidator.validateCreate(name, phone);

        Customer customer = Customer.builder()
                .name(name.trim())
                .phone(CustomerValidator.normalize(phone))
                .build();

        return mapToResponse(customerRepository.save(customer));
    }

    public CustomerResponse updateCustomer(Integer id, String name, String phone, Integer loyaltyPoints, Long spentAmount) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> CrmException.customerNotFound(id));

        customerValidator.validateUpdate(name, phone, id, loyaltyPoints);

        customer.setName(name.trim());
        customer.setPhone(CustomerValidator.normalize(phone));

        if (loyaltyPoints != null) {
            customer.setLoyaltyPoints(loyaltyPoints);
        }

        if (spentAmount != null) {
            customer.setSpentAmount(spentAmount);
        }

        return mapToResponse(customerRepository.save(customer));
    }

    public void deleteCustomer(Integer id) {
        if (!customerRepository.existsById(id)) {
            throw CrmException.customerNotFound(id);
        }
        customerRepository.deleteById(id);
    }

    public CustomerResponse getCustomerByPhone(String phone) {
        String cleanPhone = CustomerValidator.normalize(phone);
        Customer customer = customerRepository.findByPhoneIgnoreSpaces(cleanPhone)
                .orElseThrow(() -> CrmException.customerNotFoundByPhone(phone));
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