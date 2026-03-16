const axios = require('axios');

exports.sendDiscordNotification = async (monitorName, url, isUp) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("HATA: DISCORD_WEBHOOK_URL tanımlanmamış. Bildirim gönderilemedi.");
    return;
  }

  const message = {
    embeds: [{
      title: isUp ? "SİTE TEKRAR AYAKTA" : " SİTE ÇÖKTÜ!",
      description: `**${monitorName}** (${url}) şu an ${isUp ? 'erişilebilir' : 'erişilemez'} durumda.`,
      color: isUp ? 5763719 : 15548997, 
      footer: { text: "Uptime Monitor Sistemi" },
      timestamp: new Date()
    }]
  };

  try {
    await axios.post(webhookUrl, message);
  } catch (error) {
    console.error("Discord Webhook gönderim hatası:", error.message);
  }
};