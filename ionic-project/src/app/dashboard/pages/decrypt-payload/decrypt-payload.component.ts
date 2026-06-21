import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EncryptionService } from '../../../services/encryption.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-decrypt-payload',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent],
  templateUrl: './decrypt-payload.component.html',
  styleUrls: ['./decrypt-payload.component.scss']
})
export class DecryptPayloadComponent {
  encryptedPayload: string = '';
  decryptedPayload: string = '';
  secretKey: string = ''; // Will be set from service
  errorMessage: string = '';
  successMessage: string = '';

  // For reverse - encrypt plain JSON
  plainTextJson: string = '';
  encryptedResult: string = '';

  constructor(private encryptionService: EncryptionService) {
    // Get the secret key from the service (read-only)
    this.secretKey = this.encryptionService.getEncryptionKey();
  }

  decryptPayload(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.decryptedPayload = '';

    if (!this.encryptedPayload.trim()) {
      this.errorMessage = 'Please enter an encrypted payload';
      return;
    }

    try {
      // Decrypt using the encryption service
      const decryptedData = this.encryptionService.decrypt(this.encryptedPayload.trim());
      
      // Format JSON for display
      this.decryptedPayload = JSON.stringify(decryptedData, null, 2);
      this.successMessage = 'Payload decrypted successfully!';
    } catch (error: any) {
      this.errorMessage = `Decryption failed: ${error.message}`;
      console.error('Decryption error:', error);
    }
  }

  encryptJson(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.encryptedResult = '';

    if (!this.plainTextJson.trim()) {
      this.errorMessage = 'Please enter plain text JSON';
      return;
    }

    try {
      // Validate JSON
      const jsonObject = JSON.parse(this.plainTextJson);

      // Encrypt using the encryption service
      const encryptedHex = this.encryptionService.encrypt(jsonObject);
      
      // Show the complete backend format
      const backendFormat = {
        encrypted: true,
        data: encryptedHex
      };
      
      this.encryptedResult = JSON.stringify(backendFormat, null, 2);
      this.successMessage = 'JSON encrypted successfully! This is the complete format to send to backend.';
    } catch (error: any) {
      this.errorMessage = `Encryption failed: ${error.message}`;
      console.error('Encryption error:', error);
    }
  }

  copyToClipboard(text: string, type: string): void {
    if (!text) {
      this.errorMessage = `No ${type} to copy`;
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.successMessage = `${type} copied to clipboard!`;
      setTimeout(() => this.successMessage = '', 2000);
    }).catch(err => {
      this.errorMessage = 'Failed to copy to clipboard';
      console.error('Copy error:', err);
    });
  }

  clearAll(): void {
    this.encryptedPayload = '';
    this.decryptedPayload = '';
    this.plainTextJson = '';
    this.encryptedResult = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  formatJson(): void {
    if (!this.decryptedPayload) return;
    
    try {
      const jsonObject = JSON.parse(this.decryptedPayload);
      this.decryptedPayload = JSON.stringify(jsonObject, null, 2);
    } catch (error) {
      this.errorMessage = 'Invalid JSON format';
    }
  }
}
