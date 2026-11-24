export interface NotificationSettings {
  telegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
  };
  email: {
    enabled: boolean;
    recipient: string;
    senderName: string;
    senderEmail?: string;
    resendApiKey?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    smtpSecure?: boolean;
  };
  events: {
    notifyNewOrder: { telegram: boolean; email: boolean };
    notifySuccessOrder: { telegram: boolean; email: boolean };
    notifyFailedOrder: { telegram: boolean; email: boolean };
    notifyWeeklyReport: { telegram: boolean; email: boolean };
    notifyDailyReport: { telegram: boolean; email: boolean };
  };
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  telegram: {
    enabled: false,
    botToken: "",
    chatId: "",
  },
  email: {
    enabled: false,
    recipient: "",
    senderName: "XYZPEDIA Store Bot",
    senderEmail: "noreply@xyzpedia.my.id",
    resendApiKey: "",
    smtpHost: "smtp.gmail.com",
    smtpPort: 465,
    smtpUser: "",
    smtpPass: "",
    smtpSecure: true,
  },
  events: {
    notifyNewOrder: { telegram: true, email: false },
    notifySuccessOrder: { telegram: true, email: true },
    notifyFailedOrder: { telegram: true, email: true },
    notifyWeeklyReport: { telegram: true, email: true },
    notifyDailyReport: { telegram: true, email: false },
  },
};
