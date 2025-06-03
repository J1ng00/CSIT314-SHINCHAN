package com.shinchan.backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;

@Service
public class SendGridEmailService implements EmailService {

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    @Value("${sendgrid.sender}")
    private String sender;

    @Override
    public void sendEmail(String to, String subject, String content) {
        sendBulkEmail(List.of(to), subject, content);
    }

    @Override
    public void sendBulkEmail(List<String> recipients, String subject, String content) {
        Email from = new Email(sender);
        Content emailContent = new Content("text/plain", content);
        Mail mail = new Mail();
        mail.setFrom(from);
        mail.setSubject(subject);
        mail.addContent(emailContent);

        Personalization personalization = new Personalization();
        for (String recipient : recipients) {
            personalization.addTo(new Email(recipient));
        }
        mail.addPersonalization(personalization);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request); // ⬅️ Capture response here

            // ✅ Log response status
            System.out.println("📬 SendGrid Response Status Code: " + response.getStatusCode());
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }
}
