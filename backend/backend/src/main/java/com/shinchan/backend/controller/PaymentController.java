package com.shinchan.backend.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.shinchan.backend.model.Registration;
import com.shinchan.backend.model.Registration.Status;
import com.shinchan.backend.repository.RegistrationRepository;


@RestController
@RequestMapping("/api/payment")
@CrossOrigin
public class PaymentController {

    @Value("${sendgrid.api.key}")
    private String sendgridApiKey;

     @Value("${sendgrid.sender}")
    private String sender;

    @Autowired
    private RegistrationRepository registrationRepository;

    public static class PaymentRequest {
        public String userEmail;
        public double amount;
        public List<Object> cartItems; // You won't use this directly

        
    }

    @PostMapping
    public ResponseEntity<?> mockPayment(@RequestBody PaymentRequest req) {
        // Confirm pending registrations
        List<Registration> registrations = registrationRepository.findByUserEmailAndStatus(req.userEmail, Status.CART);
        for (Registration reg : registrations) {
            reg.setStatus(Status.PENDING);
        }
        registrationRepository.saveAll(registrations);

        // Send ticket email
        Email from = new Email(sender); // verified sender

    StringBuilder tableRows = new StringBuilder();
    for (Object item : req.cartItems) {
    @SuppressWarnings("unchecked")
    Map<String, Object> map = (Map<String, Object>) item;
    
        tableRows.append("<tr>")
            .append("<td style='padding: 8px;'>").append(map.get("eventName")).append("</td>")
            .append("<td style='padding: 8px;'>").append(map.get("ticketType")).append("</td>")
            .append("<td style='padding: 8px;'>").append(map.get("quantity")).append("</td>")
            .append("<td style='padding: 8px;'>$").append(map.get("ticketPrice")).append("</td>")
            .append("</tr>");
    }

        String html = """
          <html>
            <body style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h2 style="color: #7c3aed;">🎟️ Your Event Tickets Are Pending</h2>
                <p>Hello,</p>
                <p>Thank you for your payment! Your tickets are pending approval from the organizers. Below are the details:</p>
            
                <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                  <thead>
                    <tr style="background-color: #f3f4f6;">
                      <th style="text-align: left; padding: 8px;">Event</th>
                      <th style="text-align: left; padding: 8px;">Ticket Type</th>
                      <th style="text-align: left; padding: 8px;">Qty</th>
                      <th style="text-align: left; padding: 8px;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
        """ + tableRows.toString() + 
        """
                  </tbody>
                </table>
        
                <p style="margin-top: 24px;">Show this email at the event entrance.</p>
                <p style="color: gray; font-size: 0.9em;">Need help? Just reply to this email.</p>
              </div>
            </body>
          </html>
        """;


        Email to = new Email(req.userEmail);
        StringBuilder body = new StringBuilder("Thanks for your payment. Here are your tickets:\n\n");
        for (Object item : req.cartItems) {
            body.append("- ").append(item.toString()).append("\n");
        }
        body.append("\nShow this email at the event for entry.");

        Content content = new Content("text/html", html);
        String subject = "🎟️ Your Tickets Are Pending Approval!";
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendgridApiKey);
        Request sendReq = new Request();
        try {
            sendReq.setMethod(Method.POST);
            sendReq.setEndpoint("mail/send");
            sendReq.setBody(mail.build());
            Response response = sg.api(sendReq);
            System.out.println("SendGrid Response Status Code: " + response.getStatusCode());

        } catch (IOException ex) {
            ex.printStackTrace();
        }

        return ResponseEntity.ok("Payment confirmed and tickets emailed.");
    }

}

