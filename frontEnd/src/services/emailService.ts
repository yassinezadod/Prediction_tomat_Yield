// src/services/emailService.ts

import { apiClient } from './api';
import { EmailRequest } from '../types';

class EmailService {
  // Envoyer un email simple
  async sendEmail(emailData: EmailRequest): Promise<{ message: string }> {
    try {
      // Créer FormData pour les fichiers joints
      const formData = new FormData();
      
      // Ajouter les données de l'email
      formData.append('subject', emailData.subject);
      formData.append('body', emailData.body);
      formData.append('name', emailData.name);
      formData.append('company_name', emailData.company_name);
      formData.append('sender_mail_id', emailData.sender_mail_id);
      formData.append('to', emailData.to.join(','));
      
      if (emailData.cc && emailData.cc.length > 0) {
        formData.append('cc', emailData.cc.join(','));
      }
      
      if (emailData.button) {
        formData.append('button', emailData.button);
      }
      
      if (emailData.url) {
        formData.append('url', emailData.url);
      }

      // Ajouter les fichiers joints
      if (emailData.attachments) {
        emailData.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await apiClient.postFormData<{ message: string }>('/mail', formData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email');
    }
  }

  // Envoyer des emails en masse
  async sendBulkEmail(emailData: EmailRequest): Promise<{ message: string }> {
    try {
      // Créer FormData pour les fichiers joints
      const formData = new FormData();
      
      // Ajouter les données de l'email
      formData.append('subject', emailData.subject);
      formData.append('body', emailData.body);
      formData.append('name', emailData.name);
      formData.append('company_name', emailData.company_name);
      formData.append('sender_mail_id', emailData.sender_mail_id);
      formData.append('to', emailData.to.join(','));
      
      if (emailData.cc && emailData.cc.length > 0) {
        formData.append('cc', emailData.cc.join(','));
      }
      
      if (emailData.button) {
        formData.append('button', emailData.button);
      }
      
      if (emailData.url) {
        formData.append('url', emailData.url);
      }

      // Ajouter les fichiers joints
      if (emailData.attachments) {
        emailData.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await apiClient.postFormData<{ message: string }>('/mail/send_bulk', formData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi des emails en masse');
    }
  }

  // Valider les adresses email
  validateEmails(emails: string[]): { valid: string[]; invalid: string[] } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid: string[] = [];
    const invalid: string[] = [];

    emails.forEach(email => {
      const trimmedEmail = email.trim();
      if (emailRegex.test(trimmedEmail)) {
        valid.push(trimmedEmail);
      } else {
        invalid.push(trimmedEmail);
      }
    });

    return { valid, invalid };
  }

  // Valider les données d'email
  validateEmailData(emailData: EmailRequest): string[] {
    const errors: string[] = [];

    if (!emailData.subject || emailData.subject.trim() === '') {
      errors.push('Le sujet est requis');
    }

    if (!emailData.body || emailData.body.trim() === '') {
      errors.push('Le corps du message est requis');
    }

    if (!emailData.name || emailData.name.trim() === '') {
      errors.push('Le nom est requis');
    }

    if (!emailData.company_name || emailData.company_name.trim() === '') {
      errors.push('Le nom de l\'entreprise est requis');
    }

    if (!emailData.sender_mail_id || emailData.sender_mail_id.trim() === '') {
      errors.push('L\'email de l\'expéditeur est requis');
    }

    if (!emailData.to || emailData.to.length === 0) {
      errors.push('Au moins un destinataire est requis');
    } else {
      const { invalid } = this.validateEmails(emailData.to);
      if (invalid.length > 0) {
        errors.push(`Adresses email invalides: ${invalid.join(', ')}`);
      }
    }

    if (emailData.cc && emailData.cc.length > 0) {
      const { invalid } = this.validateEmails(emailData.cc);
      if (invalid.length > 0) {
        errors.push(`Adresses email CC invalides: ${invalid.join(', ')}`);
      }
    }

    return errors;
  }

  // Créer un objet EmailRequest avec des valeurs par défaut
  createEmailRequest(data: Partial<EmailRequest>): EmailRequest {
    return {
      to: data.to || [],
      cc: data.cc || [],
      subject: data.subject || '',
      body: data.body || '',
      name: data.name || '',
      company_name: data.company_name || '',
      sender_mail_id: data.sender_mail_id || '',
      button: data.button,
      url: data.url,
      attachments: data.attachments || []
    };
  }
}

export const emailService = new EmailService();