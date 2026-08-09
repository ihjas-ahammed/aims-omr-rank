import { StudentProgressRecord } from '../services/studyProgressService';

export interface WhatsAppAPISettings {
  accessToken: string;
  phoneNumberId: string;
  templateName: string;
  customCaption: string;
  useCloudAPI: boolean;
}

export interface BatchWhatsAppProgressState {
  targetClass: string;
  totalCount: number;
  completedCount: number;
  sentAdmissionNos: string[];
  failedAdmissionNos: string[];
  lastUpdated: string;
  isPaused: boolean;
}

const STORAGE_KEY_WA_SETTINGS = 'aims_whatsapp_api_settings';
const STORAGE_KEY_BATCH_STATE = 'aims_whatsapp_batch_dispatch_state';

export const DEFAULT_WA_PHONE_NUMBER_ID = '1245984048606793';
export const DEFAULT_WA_ACCESS_TOKEN = 'EAGPuZBDbRZBxcBSLLx9cZAvEqRnTKcLQlr3u2Go1HgbDW1S8gKWK7SaRsykOwDJgZC2PW78Wv2N7TFbN9EddYKtLXt6A6ZChSDZC8cUpPVp5FA0sa0AJrTgugs3BqXXLARJAuUZCo40Pj7ZBkmD4Ir0tCjUKZCU4blQ8uNr0BUO4JwE7qExMwYQ2kjTLQcdD4PwZDZD';

export function getExamDaysLeft(): number {
  const now = new Date();
  const currentDay = now.getDate();
  const examDay = 13;
  const remaining = examDay - currentDay;
  return remaining > 0 ? remaining : 0;
}

export const DEFAULT_WA_CAPTION = `    AIMS MISSION SUCCESS
         STUDY PROGRESS  
                   UPDATE
       🎯. 🎯. 🎯. 🎯. 🎯. 🎯

MISSION SUCCESS-ന്റെ ഭാഗമായി ഇതുവരെ study Progress report -ൽ അപ്ഡേറ്റ് ചെയ്ത പഠന പുരോഗതിയുടെ റിപ്പോർട്ട് ഇതോടൊപ്പം അയക്കുന്നു.

ഈ റിപ്പോർട്ട് ശ്രദ്ധയോടെ പരിശോധിക്കുക. ഇതിലൂടെ പഠനത്തിന്റെ ഇപ്പോഴത്തെ സ്ഥിതിയും, ഇനി പൂർത്തിയാക്കാനുള്ള ചാപ്റ്ററുകളും വ്യക്തമായി മനസ്സിലാക്കാൻ കഴിയും.

👉തീർക്കാൻ ബാക്കിയുള്ള ചാപ്റ്ററുകൾ കണ്ടെത്തുക.
👉തുടർന്നുള്ള ദിവസങ്ങളിൽ പൂർത്തിയാക്കേണ്ട പാഠഭാഗങ്ങൾ കൃത്യമായി പ്ലാൻ ചെയ്യുക.
👉Progress കുറവുള്ള വിഷയങ്ങൾക്ക് കൂടുതൽ സമയം നൽകുക.
👉ഓരോ ദിവസവും നിശ്ചയിച്ച പഠനലക്ഷ്യം പൂർത്തിയാക്കി പരീക്ഷയ്ക്ക് മുമ്പ് എല്ലാ ചാപ്റ്ററുകളും ക്ലിയർ ചെയ്യാൻ ശ്രമിക്കുക.

പരീക്ഷയ്ക്ക് ഇനി {daysLeft} ദിവസങ്ങൾ മാത്രമാണ് ബാക്കിയുള്ളത്. അതിനാൽ ഓരോ ദിവസവും പരമാവധി ഫലപ്രദമായി ഉപയോഗിക്കുക.

ഈ റിപ്പോർട്ട് വ്യക്തിഗത Study Roadmap തയ്യാറാക്കുന്നതിനുള്ള മാർഗ്ഗനിർദേശമാണ്. മറ്റേതെങ്കിലും ഫലപ്രദമായ രീതിയിൽ പഠനം ക്രമീകരിച്ചിട്ടുണ്ടെങ്കിൽ, അതേ പ്ലാൻ അനുസരിച്ച് ആത്മവിശ്വാസത്തോടെ മുന്നോട്ട് പോകുക.

With Best Wishes,
AIMS Academic Coordinator`;

export function getWhatsAppSettings(): WhatsAppAPISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WA_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        accessToken: parsed.accessToken || DEFAULT_WA_ACCESS_TOKEN,
        phoneNumberId: parsed.phoneNumberId || DEFAULT_WA_PHONE_NUMBER_ID,
        templateName: parsed.templateName || 'jaspers_market_order_confirmation_v1',
        customCaption: parsed.customCaption || DEFAULT_WA_CAPTION,
        useCloudAPI: parsed.useCloudAPI ?? true
      };
    }
  } catch (e) {}

  return {
    accessToken: DEFAULT_WA_ACCESS_TOKEN,
    phoneNumberId: DEFAULT_WA_PHONE_NUMBER_ID,
    templateName: 'jaspers_market_order_confirmation_v1',
    customCaption: DEFAULT_WA_CAPTION,
    useCloudAPI: true
  };
}

export function saveWhatsAppSettings(settings: WhatsAppAPISettings): void {
  localStorage.setItem(STORAGE_KEY_WA_SETTINGS, JSON.stringify(settings));
}

export function saveBatchWhatsAppProgress(state: BatchWhatsAppProgressState): void {
  localStorage.setItem(STORAGE_KEY_BATCH_STATE, JSON.stringify(state));
}

export function getBatchWhatsAppProgress(): BatchWhatsAppProgressState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BATCH_STATE);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function clearBatchWhatsAppProgress(): void {
  localStorage.removeItem(STORAGE_KEY_BATCH_STATE);
}

export function formatWhatsAppPhoneNumber(phone?: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

export function formatCustomCaption(
  templateStr: string,
  record: StudentProgressRecord
): string {
  let result = templateStr || DEFAULT_WA_CAPTION;
  const daysLeft = getExamDaysLeft();

  // Dynamic remaining days calculation (13 - current_day_of_month)
  result = result.replace(/\{daysLeft\}/gi, `${daysLeft}`);
  result = result.replace(/\b\d+\s*ദിവസങ്ങൾ\b/gi, `${daysLeft} ദിവസങ്ങൾ`);

  result = result.replace(/\{name\}/gi, record.studentName || 'Student');
  result = result.replace(/\{admNo\}/gi, record.admissionNo || 'N/A');
  result = result.replace(/\{class\}/gi, record.studentClass || 'N/A');
  result = result.replace(/\{percentage\}/gi, `${record.overallPercentage || 0}`);
  result = result.replace(/\{phone\}/gi, record.phoneNumber || '');
  result = result.replace(/\{medium\}/gi, record.medium || 'English');
  result = result.replace(/\{link\}/gi, 'https://aims-kondotty1.web.app/form/studyprogress');
  return result;
}

export function generateWhatsAppWebShareUrl(
  record: StudentProgressRecord,
  customCaption?: string
): string {
  const phone = formatWhatsAppPhoneNumber(record.phoneNumber);
  const text = formatCustomCaption(customCaption || DEFAULT_WA_CAPTION, record);
  const encodedText = encodeURIComponent(text);
  
  if (phone) {
    return `https://wa.me/${phone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

export async function sendReportViaWhatsAppCloudAPI(
  record: StudentProgressRecord,
  canvas: HTMLCanvasElement,
  settingsOverride?: WhatsAppAPISettings
): Promise<{ success: boolean; message: string }> {
  const settings = settingsOverride || getWhatsAppSettings();
  const phone = formatWhatsAppPhoneNumber(record.phoneNumber);

  console.log(`🚀 [WhatsApp API] Starting send process for student: "${record.studentName}" | Phone: ${phone} | Adm: ${record.admissionNo}`);
  console.log(`⚙️ [WhatsApp API Settings] Phone ID: "${settings.phoneNumberId}" | Token prefix: "${settings.accessToken?.substring(0, 15)}..."`);

  if (!phone) {
    console.error(`❌ [WhatsApp API Error] Student "${record.studentName}" does not have a valid formatted phone number.`);
    return { success: false, message: 'Student does not have a valid phone number registered.' };
  }
  if (!settings.accessToken || !settings.phoneNumberId) {
    console.error(`❌ [WhatsApp API Error] Missing credentials - AccessToken present: ${!!settings.accessToken}, PhoneID present: ${!!settings.phoneNumberId}`);
    return { success: false, message: 'WhatsApp API credentials (Access Token / Phone ID) not configured.' };
  }

  const captionText = formatCustomCaption(settings.customCaption, record);

  try {
    // 1. Convert Canvas to PNG Blob
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) {
      console.error(`❌ [WhatsApp API Error] Failed to generate PNG blob for ${record.studentName}`);
      return { success: false, message: 'Failed to generate scorecard image blob.' };
    }
    console.log(`📸 [WhatsApp API] PNG Blob generated: ${blob.size} bytes`);

    // 2. Upload PNG Blob to Meta Media API
    const formData = new FormData();
    formData.append('file', blob, `scorecard_${record.admissionNo}.png`);
    formData.append('type', 'image/png');
    formData.append('messaging_product', 'whatsapp');

    const mediaUrl = `https://graph.facebook.com/v26.0/${settings.phoneNumberId.trim()}/media`;
    console.log(`📤 [WhatsApp API] Uploading media to Meta endpoint: ${mediaUrl}`);

    const mediaRes = await fetch(mediaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.accessToken.trim()}`
      },
      body: formData
    });

    const mediaData = await mediaRes.json();
    console.log(`📥 [WhatsApp Media Upload Response] Status: ${mediaRes.status} ${mediaRes.statusText}`, mediaData);

    const mediaId = mediaData?.id;

    if (!mediaRes.ok || !mediaId) {
      const errDetail = mediaData?.error?.message || mediaData?.error?.error_data?.details || `HTTP ${mediaRes.status} ${mediaRes.statusText}`;
      console.error(`❌ [WhatsApp Media Upload FAILED]`, mediaData);
      return {
        success: false,
        message: `Media Upload Failed: ${errDetail}`
      };
    }

    console.log(`✅ [WhatsApp API] Media uploaded successfully! Media ID: ${mediaId}`);

    // 3. Send Image Message via Meta API
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'image',
      image: {
        id: mediaId,
        caption: captionText
      }
    };

    const sendUrl = `https://graph.facebook.com/v26.0/${settings.phoneNumberId.trim()}/messages`;
    console.log(`📤 [WhatsApp API] Dispatching message payload to: ${sendUrl}`, payload);

    const sendRes = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.accessToken.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const sendData = await sendRes.json();
    console.log(`📥 [WhatsApp Message Send Response] Status: ${sendRes.status} ${sendRes.statusText}`, sendData);

    if (sendRes.ok && sendData?.messages?.[0]?.id) {
      const msgId = sendData.messages[0].id;
      console.log(`🎉 [WhatsApp API SUCCESS] Message delivered! ID: ${msgId}`);
      return { success: true, message: `Report sent successfully to ${phone} on WhatsApp!` };
    } else {
      const errMsg = sendData?.error?.message || sendData?.error?.error_data?.details || `HTTP ${sendRes.status} ${sendRes.statusText}`;
      console.error(`❌ [WhatsApp Message Send FAILED]`, sendData);
      return { success: false, message: `WhatsApp Message Error: ${errMsg}` };
    }
  } catch (err: any) {
    console.error(`💥 [WhatsApp Network/API Exception]`, err);
    return { success: false, message: `Network/API Error: ${err.message || err}` };
  }
}

/**
 * Checks if a timestamp falls on the current calendar day.
 */
export function isSentToday(timestamp?: string): boolean {
  if (!timestamp) return false;
  const d = new Date(timestamp);
  const now = new Date();
  if (isNaN(d.getTime())) return false;
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth() === now.getMonth() &&
         d.getDate() === now.getDate();
}

/**
 * Calculates start (Monday 00:00:00) and end (Sunday 23:59:59) of the current calendar week.
 */
export function getCurrentWeekBounds(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const distanceToMonday = (dayOfWeek + 6) % 7;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

/**
 * Counts how many times a scorecard was successfully sent to this student during the current calendar week.
 */
export function getWeeklySendCount(record: StudentProgressRecord): number {
  const { start, end } = getCurrentWeekBounds();
  const history = record.whatsappSentHistory || [];
  
  let count = 0;
  // Count history entries falling in current week
  history.forEach(ts => {
    const d = new Date(ts);
    if (!isNaN(d.getTime()) && d >= start && d <= end) {
      count++;
    }
  });

  // If whatsappSentAt is set and not already present in history array
  if (record.whatsappSentAt) {
    const d = new Date(record.whatsappSentAt);
    if (!isNaN(d.getTime()) && d >= start && d <= end) {
      const alreadyInHistory = history.some(ts => Math.abs(new Date(ts).getTime() - d.getTime()) < 2000);
      if (!alreadyInHistory) count++;
    }
  }

  return count;
}

/**
 * Determines whether a student is eligible for batch WhatsApp dispatch:
 * 1. Must have valid phone number
 * 2. Must NOT have been sent a message today
 * 3. Must NOT have exceeded 2 sends in the current calendar week
 */
export function isEligibleForBatchWhatsApp(record: StudentProgressRecord): { eligible: boolean; reason?: string } {
  const phone = formatWhatsAppPhoneNumber(record.phoneNumber);
  if (!phone) {
    return { eligible: false, reason: 'No registered phone number' };
  }

  if (isSentToday(record.whatsappSentAt)) {
    return { eligible: false, reason: 'Already sent today' };
  }

  const weeklyCount = getWeeklySendCount(record);
  if (weeklyCount >= 2) {
    return { eligible: false, reason: `Weekly limit reached (${weeklyCount}/2 sent this week)` };
  }

  return { eligible: true };
}
