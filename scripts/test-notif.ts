import { sendTelegramMessage, sendEmailMessage, getNotificationSettings } from "../src/lib/notifications";

async function main() {
  const s = await getNotificationSettings();
  console.log("Settings:", {
    tgEnabled: s.telegram.enabled,
    hasTgToken: !!s.telegram.botToken,
    tgChatId: s.telegram.chatId,
    emailEnabled: s.email.enabled,
    recipient: s.email.recipient,
  });

  console.log("Testing Telegram dispatch...");
  const resTg = await sendTelegramMessage(
    s.telegram.botToken,
    s.telegram.chatId,
    "✅ <b>[TEST NOTIFIKASI] XYZPEDIA</b>\nSistem notifikasi Telegram aktif dan terhubung!"
  );
  console.log("Telegram response:", resTg);

  console.log("Testing Email dispatch to:", s.email.recipient);
  const resEmail = await sendEmailMessage(
    s.email.recipient,
    "✅ Bukti Transaksi Sukses · XYZPEDIA",
    "<h2>Pembayaran Berhasil!</h2><p>Pesanan Anda telah diproses dan diamond berhasil masuk.</p>"
  );
  console.log("Email response:", resEmail);
}

main().catch(console.error);
