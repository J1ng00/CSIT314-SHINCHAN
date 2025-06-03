package com.shinchan.backend.controller;

import java.util.List;

public interface EmailService {
    void sendEmail(String to, String subject, String content);
    void sendBulkEmail(List<String> recipients, String subject, String content);
}
