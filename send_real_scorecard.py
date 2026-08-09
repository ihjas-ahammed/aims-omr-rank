import os
import requests
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont

def get_days_left():
    today_day = datetime.now().day
    exam_day = 13
    remaining = exam_day - today_day
    return max(remaining, 0)

def generate_report_card(filename="real_scorecard_4812.png"):
    width, height = 1000, 1350
    days_left = get_days_left()

    # Dark slate main canvas background
    image = Image.new("RGBA", (width, height), (15, 23, 42, 255))
    draw = ImageDraw.Draw(image)

    # Try loading fonts or fallback
    try:
        font_large = ImageFont.truetype("DejaVuSans-Bold.ttf", 32)
        font_title = ImageFont.truetype("DejaVuSans-Bold.ttf", 26)
        font_bold = ImageFont.truetype("DejaVuSans-Bold.ttf", 20)
        font_regular = ImageFont.truetype("DejaVuSans.ttf", 18)
        font_small = ImageFont.truetype("DejaVuSans.ttf", 14)
        font_kpi = ImageFont.truetype("DejaVuSans-Bold.ttf", 48)
    except Exception:
        font_large = font_title = font_bold = font_regular = font_small = font_kpi = ImageFont.load_default()

    # Colors
    bg_card = (30, 41, 59, 255)
    border_card = (51, 65, 85, 255)
    accent_blue = (2, 132, 199, 255)
    accent_emerald = (16, 185, 129, 255)
    accent_amber = (245, 158, 11, 255)
    accent_indigo = (99, 102, 241, 255)
    text_white = (255, 255, 255, 255)
    text_muted = (148, 163, 184, 255)

    # 1. WHITE HEADER BANNER (FG Black & Blue)
    draw.rounded_rectangle([(35, 30), (width - 35, 160)], radius=20, fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=2)
    
    # Draw uploaded logo
    logo_path = "public/logo1.png"
    logo_offset = 65
    if os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path).convert("RGBA")
            logo = logo.resize((150, 105), Image.Resampling.LANCZOS)
            image.paste(logo, (55, 42), logo)
            logo_offset = 225
        except Exception as e:
            print("Logo paste error:", e)

    draw.text((logo_offset, 50), "AIMS ACADEMIC EVALUATION SYSTEMS", font=font_small, fill=accent_blue)
    draw.text((logo_offset, 75), "STUDENT STUDY PROGRESS REPORT", font=font_large, fill=(15, 23, 42, 255))
    draw.text((logo_offset, 120), f"MISSION SUCCESS MATRIX • EXAM IN {days_left} DAYS", font=font_small, fill=(71, 85, 105, 255))

    # 2. Student Info Card
    draw.rounded_rectangle([(35, 180), (width - 35, 310)], radius=20, fill=bg_card, outline=border_card, width=2)
    
    draw.text((65, 205), "STUDENT NAME", font=font_small, fill=text_muted)
    draw.text((65, 230), "AISHA FATHIMA", font=font_title, fill=text_white)
    draw.text((65, 270), "Medium: English Medium", font=font_regular, fill=(165, 180, 252, 255))

    draw.text((420, 205), "ADMISSION NO", font=font_small, fill=text_muted)
    draw.text((420, 230), "4812", font=font_title, fill=text_white)
    draw.text((420, 270), "Class: Batch E1", font=font_regular, fill=text_white)

    draw.text((720, 205), "FIRST LANGUAGE", font=font_small, fill=text_muted)
    draw.text((720, 230), "Malayalam I", font=font_title, fill=text_white)
    draw.text((720, 270), f"Exam Target: {days_left} Days Left", font=font_regular, fill=accent_amber)

    # 3. Overall Completion Metric Card
    draw.rounded_rectangle([(35, 335), (width - 35, 470)], radius=20, fill=(49, 46, 129, 255), outline=(99, 102, 241, 255), width=2)
    
    draw.text((65, 360), "MISSION SUCCESS - OVERALL PROGRESS COMPLETION", font=font_small, fill=(199, 210, 254, 255))
    draw.text((65, 385), "88%", font=font_kpi, fill=text_white)
    draw.text((215, 410), f"21 of 24 Checkpoints Ticked • Only {days_left} Days Left For Exam!", font=font_regular, fill=(224, 231, 255, 255))

    # Overall Progress Bar
    draw.rounded_rectangle([(65, 445), (width - 65, 457)], radius=6, fill=(30, 27, 75, 255))
    draw.rounded_rectangle([(65, 445), (65 + int((width - 130) * 0.88), 457)], radius=6, fill=accent_emerald)

    # 4. Subject Breakdown Section Title
    draw.text((35, 500), "SUBJECT-WISE PROGRESS BREAKDOWN", font=font_title, fill=text_white)

    # Subjects List
    subjects = [
        {"name": "Physics (PHY)", "pct": 100, "status": "Fully Ticked (3/3)", "color": accent_emerald},
        {"name": "Chemistry (CHE)", "pct": 83, "status": "In Progress (2.5/3)", "color": accent_indigo},
        {"name": "Biology (BIO)", "pct": 100, "status": "Fully Ticked (3/3)", "color": accent_emerald},
        {"name": "Mathematics (MAT)", "pct": 75, "status": "In Progress (2.25/3)", "color": accent_amber},
        {"name": "Social Science (SOC)", "pct": 90, "status": "In Progress (2.7/3)", "color": accent_indigo},
        {"name": "English (ENG)", "pct": 100, "status": "Fully Ticked (3/3)", "color": accent_emerald},
        {"name": "Malayalam I (MAL)", "pct": 83, "status": "In Progress (2.5/3)", "color": accent_indigo},
    ]

    cur_y = 545
    for s in subjects:
        draw.rounded_rectangle([(35, cur_y), (width - 35, cur_y + 85)], radius=16, fill=bg_card, outline=border_card, width=1)
        
        draw.text((65, cur_y + 15), s["name"], font=font_bold, fill=text_white)
        pct_text = f"{s['pct']}%"
        draw.text((width - 130, cur_y + 15), pct_text, font=font_bold, fill=s["color"])
        draw.text((width - 310, cur_y + 18), s["status"], font=font_small, fill=text_muted)

        # Progress bar
        bar_x1, bar_x2 = 65, width - 65
        bar_w = bar_x2 - bar_x1
        fill_w = int(bar_w * (s["pct"] / 100.0))
        
        draw.rounded_rectangle([(bar_x1, cur_y + 55), (bar_x2, cur_y + 67)], radius=6, fill=(15, 23, 42, 255))
        if fill_w > 0:
            draw.rounded_rectangle([(bar_x1, cur_y + 55), (bar_x1 + fill_w, cur_y + 67)], radius=6, fill=s["color"])

        cur_y += 98

    # Footer
    draw.rectangle([(0, height - 70), (width, height)], fill=(15, 23, 42, 255))
    draw.line([(35, height - 70), (width - 35, height - 70)], fill=border_card, width=1)
    draw.text((35, height - 50), "Generated by AIMS Group of Institutions • Verification: aims-kondotty1.web.app", font=font_small, fill=text_muted)
    draw.text((width - 280, height - 50), "Official Verified Report", font=font_small, fill=accent_blue)

    image.save(filename)
    print(f"Generated report card image with {days_left} days left: {filename}")
    return filename

def send_whatsapp_report():
    img_file = generate_report_card()
    days_left = get_days_left()
    
    phone_number_id = "1245984048606793"
    access_token = "EAGPuZBDbRZBxcBSLLx9cZAvEqRnTKcLQlr3u2Go1HgbDW1S8gKWK7SaRsykOwDJgZC2PW78Wv2N7TFbN9EddYKtLXt6A6ZChSDZC8cUpPVp5FA0sa0AJrTgugs3BqXXLARJAuUZCo40Pj7ZBkmD4Ir0tCjUKZCU4blQ8uNr0BUO4JwE7qExMwYQ2kjTLQcdD4PwZDZD"
    recipient_phone = "917034201062"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # 1. Upload Media
    print("Uploading scorecard PNG to Meta WhatsApp Media Endpoint...")
    with open(img_file, "rb") as f:
        files = {
            "file": (img_file, f, "image/png"),
            "type": (None, "image/png"),
            "messaging_product": (None, "whatsapp")
        }
        media_res = requests.post(f"https://graph.facebook.com/v26.0/{phone_number_id}/media", headers=headers, files=files)
    
    media_data = media_res.json()
    print("Media Upload Response:", media_data)
    media_id = media_data.get("id")

    if not media_id:
        print("Failed to upload media:", media_data)
        return

    # 2. Dynamic Malayalam Caption with calculated days_left (13 - today's date)
    caption = f"""    AIMS MISSION SUCCESS
         STUDY PROGRESS  
                   UPDATE
       🎯. 🎯. 🎯. 🎯. 🎯. 🎯

MISSION SUCCESS-ന്റെ ഭാഗമായി ഇതുവരെ study Progress report -ൽ അപ്ഡേറ്റ് ചെയ്ത പഠന പുരോഗതിയുടെ റിപ്പോർട്ട് ഇതോടൊപ്പം അയക്കുന്നു.

ഈ റിപ്പോർട്ട് ശ്രദ്ധയോടെ പരിശോധിക്കുക. ഇതിലൂടെ പഠനത്തിന്റെ ഇപ്പോഴത്തെ സ്ഥിതിയും, ഇനി പൂർത്തിയാക്കാനുള്ള ചാപ്റ്ററുകളും വ്യക്തമായി മനസ്സിലാക്കാൻ കഴിയും.

👉തീർക്കാൻ ബാക്കിയുള്ള ചാപ്റ്ററുകൾ കണ്ടെത്തുക.
👉തുടർന്നുള്ള ദിവസങ്ങളിൽ പൂർത്തിയാക്കേണ്ട പാഠഭാഗങ്ങൾ കൃത്യമായി പ്ലാൻ ചെയ്യുക.
👉Progress കുറവുള്ള വിഷയങ്ങൾക്ക് കൂടുതൽ സമയം നൽകുക.
👉ഓരോ ദിവസവും നിശ്ചയിച്ച പഠനലക്ഷ്യം പൂർത്തിയാക്കി പരീക്ഷയ്ക്ക് മുമ്പ് എല്ലാ ചാപ്റ്ററുകളും ക്ലിയർ ചെയ്യാൻ ശ്രമിക്കുക.

പരീക്ഷയ്ക്ക് ഇനി {days_left} ദിവസങ്ങൾ മാത്രമാണ് ബാക്കിയുള്ളത്. അതിനാൽ ഓരോ ദിവസവും പരമാവധി ഫലപ്രദമായി ഉപയോഗിക്കുക.

ഈ റിപ്പോർട്ട് വ്യക്തിഗത Study Roadmap തയ്യാറാക്കുന്നതിനുള്ള മാർഗ്ഗനിർദേശമാണ്. മറ്റേതെങ്കിലും ഫലപ്രദമായ രീതിയിൽ പഠനം ക്രമീകരിച്ചിട്ടുണ്ടെങ്കിൽ, അതേ പ്ലാൻ അനുസരിച്ച് ആത്മവിശ്വാസത്തോടെ മുന്നോട്ട് പോകുക.

With Best Wishes,
AIMS Academic Coordinator"""

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": recipient_phone,
        "type": "image",
        "image": {
            "id": media_id,
            "caption": caption
        }
    }

    print(f"Sending WhatsApp Scorecard Image Message with dynamic {days_left} days left...")
    msg_res = requests.post(f"https://graph.facebook.com/v26.0/{phone_number_id}/messages", json=payload, headers=headers)
    msg_data = msg_res.json()
    print("WhatsApp Message Response:", msg_data)

if __name__ == "__main__":
    send_whatsapp_report()
