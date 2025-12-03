/**
 * Email service for sending share emails via SMTP and logging to Firestore
 */

import emailjs from '@emailjs/browser';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { EmailLog, EmailLogData } from '../types';
import { COLLECTIONS } from '../utils/constants';

// EmailJS configuration from environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

/**
 * Sends a share email to a recipient with the CD share link
 * @param recipientEmail - Email address of the recipient
 * @param shareLink - The share link URL
 * @param cdName - Name of the CD being shared
 * @param senderEmail - Email of the user sharing the CD
 * @param userId - User ID of the sender
 * @param cdId - CD ID being shared
 * @param customMessage - Optional custom message from the sender
 * @returns Promise resolving to the EmailLog entry
 * @throws {Error} If email sending fails
 */
export async function sendShareEmail(
  recipientEmail: string,
  shareLink: string,
  cdName: string,
  senderEmail: string,
  userId: string,
  cdId: string,
  customMessage?: string
): Promise<EmailLog> {
  const subject = `${senderEmail} shared a CD with you: ${cdName}`;
  
  // Create initial log entry with pending status
  const emailLogData: EmailLogData = {
    userId,
    recipientEmail,
    subject,
    cdId,
    cdName,
    status: 'pending',
  };
  
  let emailLog: EmailLog;
  
  try {
    // Log the email attempt
    emailLog = await logEmail(emailLogData);
    
    // Prepare email template parameters
    const defaultMessage = `${senderEmail} has shared a CD with you called "${cdName}". Click the link below to view and download the files.`;
    const templateParams = {
      to_email: recipientEmail,
      from_email: senderEmail,
      sender_email: senderEmail,
      cd_name: cdName,
      share_link: shareLink,
      subject: subject,
      message: customMessage || defaultMessage,
      custom_message: customMessage || '',
      has_custom_message: !!customMessage,
    };
    
    // Send email using EmailJS
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    
    // Update log entry to sent status
    const logRef = doc(db, COLLECTIONS.EMAIL_LOGS, emailLog.id);
    await setDoc(logRef, {
      ...emailLogData,
      status: 'sent',
      sentAt: Timestamp.now(),
    });
    
    return {
      ...emailLog,
      status: 'sent',
    };
  } catch (error) {
    console.error('Error sending share email:', error);
    
    // Update log entry to failed status with error message
    if (emailLog!) {
      const logRef = doc(db, COLLECTIONS.EMAIL_LOGS, emailLog.id);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await setDoc(logRef, {
        ...emailLogData,
        status: 'failed',
        error: errorMessage,
        sentAt: Timestamp.now(),
      });
      
      return {
        ...emailLog,
        status: 'failed',
        error: errorMessage,
      };
    }
    
    throw error;
  }
}

/**
 * Logs an email send attempt to Firestore
 * @param emailData - Email log data to store
 * @returns Promise resolving to the created EmailLog
 */
export async function logEmail(emailData: EmailLogData): Promise<EmailLog> {
  try {
    const logRef = doc(collection(db, COLLECTIONS.EMAIL_LOGS));
    const now = new Date();
    
    const logDocument = {
      ...emailData,
      sentAt: Timestamp.fromDate(now),
    };
    
    await setDoc(logRef, logDocument);
    
    return {
      id: logRef.id,
      ...emailData,
      sentAt: now,
    };
  } catch (error) {
    console.error('Error logging email:', error);
    throw error;
  }
}

/**
 * Retrieves all email logs for a specific user
 * @param userId - The user ID to get logs for
 * @returns Promise resolving to array of EmailLog entries
 */
export async function getEmailLogs(userId: string): Promise<EmailLog[]> {
  try {
    const logsRef = collection(db, COLLECTIONS.EMAIL_LOGS);
    const q = query(logsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        recipientEmail: data.recipientEmail,
        subject: data.subject,
        cdId: data.cdId,
        cdName: data.cdName,
        status: data.status as 'pending' | 'sent' | 'failed',
        error: data.error,
        sentAt: data.sentAt.toDate(),
      };
    });
  } catch (error) {
    console.error('Error getting email logs:', error);
    throw error;
  }
}

/**
 * Retries sending a failed email
 * @param emailLogId - The ID of the failed email log entry
 * @returns Promise resolving to the updated EmailLog
 * @throws {Error} If retry fails or log not found
 */
export async function retryFailedEmail(emailLogId: string): Promise<EmailLog> {
  try {
    // Get the original email log
    const logRef = doc(db, COLLECTIONS.EMAIL_LOGS, emailLogId);
    const logSnap = await getDoc(logRef);
    
    if (!logSnap.exists()) {
      throw new Error('Email log not found');
    }
    
    // Extract necessary information to retry
    // Note: We need the original share link which should be reconstructed
    // For now, we'll throw an error as we need more context
    throw new Error('Retry functionality requires additional context (share link)');
  } catch (error) {
    console.error('Error retrying failed email:', error);
    throw error;
  }
}
