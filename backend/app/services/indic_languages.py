"""
Comprehensive 22 Scheduled Indian Languages Specification & Linguistic Assets.
Includes BCP-47 codes, native scripts, text direction, clinical terminology,
greetings, and conversational dialog templates for ASHA Sakhi.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class IndicLanguageInfo(BaseModel):
    code: str                  # ISO / internal code
    name_en: str              # English name
    name_native: str          # Native script name
    script: str               # Script name
    bcp47: str                # BCP-47 tag for speech synthesis & recognition
    dir: str = "ltr"          # "ltr" or "rtl"
    region: str               # Primary states / regions
    sample_greeting: str      # Spoken greeting
    sample_anc_phrase: str    # Sample voice register utterance
    sample_danger_phrase: str # Sample danger sign utterance
    sample_query_phrase: str  # Sample record retrieval query


# The 22 Scheduled Languages of the Eighth Schedule of the Indian Constitution
INDIC_LANGUAGES: Dict[str, IndicLanguageInfo] = {
    "as": IndicLanguageInfo(
        code="as",
        name_en="Assamese",
        name_native="অসমীয়া",
        script="Bengali-Assamese",
        bcp47="as-IN",
        dir="ltr",
        region="Assam",
        sample_greeting="নমস্কাৰ আশা বাইদেউ, মই আশা সখী। আজি কেনেকৈ সহায় কৰিব পাৰো?",
        sample_anc_phrase="উপভোক্তা ৰেখা BEN-AS-001, ANC পৰীক্ষা, ওজন ৫২ কেজি, টিটি বেজী দিয়া হ'ল।",
        sample_danger_phrase="গৰ্ভাৱস্থাত অত্যাধিক ৰক্তস্ৰাৱ হৈছে, অতি সোনকালে হাস্পতাললৈ লৈ যাব লাগে।",
        sample_query_phrase="ৰেখাৰ পূৰ্বৰ পৰীক্ষাৰ তথ্য দেখুৱাওক।"
    ),
    "bn": IndicLanguageInfo(
        code="bn",
        name_en="Bengali",
        name_native="বাংলা",
        script="Bengali",
        bcp47="bn-IN",
        dir="ltr",
        region="West Bengal, Tripura",
        sample_greeting="নমস্কার আশা দিদি, আমি আশা সখী। আজ কীভাবে সাহায্য করতে পারি?",
        sample_anc_phrase="উপভোক্তা লক্ষ্মী BEN-BN-001, ANC পরীক্ষা, ওজন ৫৩ কেজি, টিটি ইনজেকশন দেওয়া হয়েছে।",
        sample_danger_phrase="প্রচুর রক্তপাত হচ্ছে এবং খুব দুর্বল লাগছে, অবিলম্বে পিএইচসি হাসপাতালে নিতে হবে।",
        sample_query_phrase="লক্ষ্মীর আগের ভিজিটের রেকর্ড দেখাও।"
    ),
    "brx": IndicLanguageInfo(
        code="brx",
        name_en="Bodo",
        name_native="बड़ो",
        script="Devanagari",
        bcp47="brx-IN",
        dir="ltr",
        region="Bodoland, Assam",
        sample_greeting="खुलुमबाय आसा आदा/आब', आं आसा सखी। दिनै माबादि हेफाफाब नांगौ?",
        sample_anc_phrase="बेनिफिसियारि रेबती BEN-BR-001, ANC आनजाद, लिरथाय 51 kg, TT सुइ होनाय जाबाय।",
        sample_danger_phrase="गोबां थै ओंखारदों आरो खमजोर जाबाय, थाबैनो हस्पिटालाव लांनांगौ।",
        sample_query_phrase="रेबतीनि सिगांनि रेकर्डखौ देखाय।"
    ),
    "doi": IndicLanguageInfo(
        code="doi",
        name_en="Dogri",
        name_native="डोगरी",
        script="Devanagari",
        bcp47="doi-IN",
        dir="ltr",
        region="Jammu & Kashmir",
        sample_greeting="नमस्ते आशा दीदी, औं आशा सखी हां। अज्ज तुंदी केह मदद करी सकदी हां?",
        sample_anc_phrase="लाभार्थी नीलम BEN-DO-001, ANC चेकअप, वजन 52 किलो, TT टीका लाया गेआ।",
        sample_danger_phrase="खून पौने दा चक्कर ऐ ते चक्कर औंदे न, जल्दी पीएचसी लेई जाओ।",
        sample_query_phrase="नीलम दा पिछला रिकार्ड दस्सो।"
    ),
    "gu": IndicLanguageInfo(
        code="gu",
        name_en="Gujarati",
        name_native="ગુજરાતી",
        script="Gujarati",
        bcp47="gu-IN",
        dir="ltr",
        region="Gujarat",
        sample_greeting="નમસ્તે આશા બહેન, હું આશા સખી છું. આજે હું તમને કેવી રીતે મદદ કરી શકું?",
        sample_anc_phrase="લાભાર્થી લક્ષ્મી BEN-GU-001, ANC તપાસ, વજન 54 કિલો, TT ઇન્જેક્શન આપ્યું છે, IFA ગોળી આપી.",
        sample_danger_phrase="ગર્ભાવસ્થામાં લોહી વહી રહ્યું છે અને ખૂબ નબળાઈ છે, તરત જ હોસ્પિટલ લઈ જવું પડશે.",
        sample_query_phrase="લક્ષ્મીની અગાઉની મુલાકાતનો રેકોર્ડ બતાવો."
    ),
    "hi": IndicLanguageInfo(
        code="hi",
        name_en="Hindi",
        name_native="हिन्दी",
        script="Devanagari",
        bcp47="hi-IN",
        dir="ltr",
        region="North & Central India",
        sample_greeting="नमस्ते आशा दीदी, मैं आशा सखी हूँ। आज मैं आपकी क्या सहायता कर सकती हूँ?",
        sample_anc_phrase="लाभार्थी रेखा BEN-HI-001, ANC जांच तीसरा महीना, वजन 54 किलो, TT इंजेक्शन दिया, IFA गोली दी।",
        sample_danger_phrase="गर्भावस्था में अत्यधिक रक्तस्राव हो रहा है और चक्कर आ रहे हैं, तुरंत 108 एम्बुलेंस बुलाएं।",
        sample_query_phrase="रेखा की पिछली जांच और टीकाकरण का विवरण दिखाएं।"
    ),
    "kn": IndicLanguageInfo(
        code="kn",
        name_en="Kannada",
        name_native="ಕನ್ನಡ",
        script="Kannada",
        bcp47="kn-IN",
        dir="ltr",
        region="Karnataka",
        sample_greeting="ನಮಸ್ಕಾರ ಆಶಾ ಅವರೇ, ನಾನು ಆಶಾ ಸಖಿ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
        sample_anc_phrase="ಫಲಾನುಭವಿ ಲಕ್ಷ್ಮಿ BEN-KA-001, ANC checkup ಮೂರನೇ ತಿಂಗಳು, weight 54 kg, TT injection ಕೊಟ್ಟಿದ್ದೇವೆ, IFA goli ಕೊಟ್ಟಿದೆ.",
        sample_danger_phrase="ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ರಕ್ತಸ್ರಾವ ಆಗುತ್ತಿದೆ ಮತ್ತು ತೀವ್ರ ತಲೆನೋವು ಇದೆ, ತಕ್ಷಣ PHC ಗೆ ರೆಫರ್ ಮಾಡಿ.",
        sample_query_phrase="ಲಕ್ಷ್ಮಿಯವರ ಹಿಂದಿನ ತಪಾಸಣೆ ವಿವರಗಳನ್ನು ತೋರಿಸಿ."
    ),
    "ks": IndicLanguageInfo(
        code="ks",
        name_en="Kashmiri",
        name_native="کٲشُر / कॉशुर",
        script="Perso-Arabic",
        bcp47="ks-IN",
        dir="rtl",
        region="Kashmir Valley",
        sample_greeting="سلام آشا دیدی، بہ چھس آشا سخی۔ از کتھ پأٹھ کریو مدَتھ؟",
        sample_anc_phrase="بینفشری زرینہ BEN-KS-001، ANC معائنہ، وزن 53 کلو، TT ٹیکہ دیتمت۔",
        sample_danger_phrase="حمل دوران چھو خون گژھان تہ سرس چکر، جلدی ہسپتال واتناوِو۔",
        sample_query_phrase="زرینہ سنز پتمچ تپاس ریکارڈ ہاوِو۔"
    ),
    "kok": IndicLanguageInfo(
        code="kok",
        name_en="Konkani",
        name_native="कोंकणी",
        script="Devanagari",
        bcp47="kok-IN",
        dir="ltr",
        region="Goa, Coastal Karnataka, Maharashtra",
        sample_greeting="नमस्कार आशा बाय, हांव आशा सखी. आयज तुका कशी मजत करूं?",
        sample_anc_phrase="लाभारती अनिता BEN-KO-001, ANC तपासणी, वजन 52 किलो, TT इंजेक्शन दिलें, IFA गुळ्यो दिल्यो.",
        sample_danger_phrase="गरोदरपणांत रगत वता आनी तकली दुखता, रोखडेंच पीएचसी हॉस्पिटलांत व्हरचें.",
        sample_query_phrase="अनिताची फाटली भेट दाखय."
    ),
    "mai": IndicLanguageInfo(
        code="mai",
        name_en="Maithili",
        name_native="मैथिली",
        script="Devanagari",
        bcp47="mai-IN",
        dir="ltr",
        region="Bihar, Jharkhand",
        sample_greeting="प्रणाम आशा दीदी, हम आशा सखी छी। आई अहाँक की सहायता कऽ सकी छी?",
        sample_anc_phrase="लाभार्थी सीता BEN-MA-001, ANC जांच, वजन 51 किलो, TT सुई देल गेल, IFA गोली देल गेल।",
        sample_danger_phrase="गर्भावस्था मे खूब रक्तस्राव भऽ रहल अछि, तुरंत पीएचसी अस्पताल लऽ जाउ।",
        sample_query_phrase="सीताक पहिनेक जांच विवरण देखाउ।"
    ),
    "ml": IndicLanguageInfo(
        code="ml",
        name_en="Malayalam",
        name_native="മലയാളം",
        script="Malayalam",
        bcp47="ml-IN",
        dir="ltr",
        region="Kerala, Lakshadweep",
        sample_greeting="നമസ്കാരം ആശാ പ്രവർത്തകരെ, ഞാൻ ആശാ സഖി. ഇന്ന് ഞാൻ എങ്ങനെ സഹായിക്കണം?",
        sample_anc_phrase="ഗുണഭോക്താവ് അനിത BEN-ML-001, ANC പരിശോധന, ഭാരം 55 kg, TT കുത്തിവെയ്പ്പ് എടുത്തു, IFA ഗുളിക നൽകി.",
        sample_danger_phrase="ഗർഭകാലത്ത് രക്തസ്രാവം ഉണ്ട്, കുഞ്ഞിന് അനക്കമില്ല, ഉടൻതന്നെ ആശുപത്രിയിൽ എത്തിക്കുക.",
        sample_query_phrase="അനിതയുടെ മുൻ സന്ദർശന വിവരങ്ങൾ കാണിക്കുക."
    ),
    "mni": IndicLanguageInfo(
        code="mni",
        name_en="Manipuri",
        name_native="মৈতৈলোন্",
        script="Bengali / Meitei Mayek",
        bcp47="mni-IN",
        dir="ltr",
        region="Manipur",
        sample_greeting="খুরুমজরি আশা ইচে, ঐহাক আশা সখিনি। ঙসি করি মতেং পাংগদগে?",
        sample_anc_phrase="বেনিফিসিয়ারি তোম্বী BEN-MN-001, ANC য়েংশিনবা, অরুম্বা 50 kg, TT তিকা কাপথোক্লে।",
        sample_danger_phrase="মিরালদা ই য়াম্না থোক্লি অমসুং কোক ঙাউরি, অথুবা মতমদা লায়য়েংশঙদা পুরোকউ।",
        sample_query_phrase="তোম্বীগী মমাংগী য়েংশিনখিবা রিকোর্দ উৎপু।"
    ),
    "mr": IndicLanguageInfo(
        code="mr",
        name_en="Marathi",
        name_native="मराठी",
        script="Devanagari",
        bcp47="mr-IN",
        dir="ltr",
        region="Maharashtra, Goa",
        sample_greeting="नमस्कार आशा ताई, मी आशा सखी आहे. आज मी आपली काय मदत करू शकते?",
        sample_anc_phrase="लाभार्थी सविता BEN-MR-001, ANC तपासणी, वजन 53 किलो, TT लस दिली, IFA गोळ्या दिल्या.",
        sample_danger_phrase="गरोदरपणात खूप रक्तस्राव होत आहे आणि चक्कर येत आहे, ताबडतोब प्राथमिक आरोग्य केंद्रात घेऊन जा.",
        sample_query_phrase="सविताच्या मागील भेटीची माहिती दाखवा."
    ),
    "ne": IndicLanguageInfo(
        code="ne",
        name_en="Nepali",
        name_native="नेपाली",
        script="Devanagari",
        bcp47="ne-NP",
        dir="ltr",
        region="Sikkim, West Bengal, Assam",
        sample_greeting="नमस्ते आशा दिदी, म आशा सखी हुँ। आज म कसरी सहयोग गर्न सक्छु?",
        sample_anc_phrase="लाभार्थी पूजा BEN-NE-001, ANC जाँच, तौल 52 किलो, TT खोप लगाइयो, IFA चक्की दिइयो।",
        sample_danger_phrase="गर्भावस्थामा धेरै रक्तस्राव भइरहेको छ, तुरुन्त अस्पताल लैजानुहोस्।",
        sample_query_phrase="पूजाको अघिल्लो जाँचको विवरण देखाउनुहोस्।"
    ),
    "or": IndicLanguageInfo(
        code="or",
        name_en="Odia",
        name_native="ଓଡ଼ିଆ",
        script="Odia",
        bcp47="or-IN",
        dir="ltr",
        region="Odisha",
        sample_greeting="ନମସ୍କାର ଆଶା ଦିଦି, ମୁଁ ଆଶା ସଖୀ। ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
        sample_anc_phrase="ହିତାଧିକାରୀ ଶାନ୍ତି BEN-OR-001, ANC ଯାଞ୍ଚ, ଓଜନ 52 କେଜି, TT ଟିକା ଦିଆଗଲା, IFA ବଟିକା ଦିଆଗଲା।",
        sample_danger_phrase="ଗର୍ଭାବସ୍ଥାରେ ଅତ୍ୟଧିକ ରକ୍ତସ୍ରାବ ହେଉଛି, ତୁରନ୍ତ ଡାକ୍ତରଖାନାକୁ ନିଅନ୍ତୁ।",
        sample_query_phrase="ଶାନ୍ତିଙ୍କ ପୂର୍ବ ପରୀକ୍ଷା ରେକର୍ଡ ଦେଖାନ୍ତୁ।"
    ),
    "pa": IndicLanguageInfo(
        code="pa",
        name_en="Punjabi",
        name_native="ਪੰਜਾਬੀ",
        script="Gurmukhi",
        bcp47="pa-IN",
        dir="ltr",
        region="Punjab, Haryana, Delhi",
        sample_greeting="ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਆਸ਼ਾ ਦੀਦੀ, ਮੈਂ ਆਸ਼ਾ ਸਖੀ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ?",
        sample_anc_phrase="ਲਾਭਪਾਤਰੀ ਸਿਮਰਨ BEN-PA-001, ANC ਜਾਂਚ, ਭਾਰ 55 ਕਿਲੋ, TT ਟੀਕਾ ਲਗਾਇਆ ਗਿਆ, IFA ਗੋਲੀਆਂ ਦਿੱਤੀਆਂ।",
        sample_danger_phrase="ਗਰਭ ਅਵਸਥਾ ਦੌਰਾਨ ਬਹੁਤ ਜ਼ਿਆਦਾ ਖੂਨ ਵਹਿ ਰਿਹਾ ਹੈ, ਤੁਰੰਤ ਹਸਪਤਾਲ ਲੈ ਕੇ ਜਾਓ।",
        sample_query_phrase="ਸਿਮਰਨ ਦਾ ਪਿਛਲਾ ਚੈਕਅੱਪ ਰਿਕਾਰਡ ਵਿਖਾਓ।"
    ),
    "sa": IndicLanguageInfo(
        code="sa",
        name_en="Sanskrit",
        name_native="संस्कृतम्",
        script="Devanagari",
        bcp47="sa-IN",
        dir="ltr",
        region="India",
        sample_greeting="नमो नमः आशा भगिनि, अहम् आशा सखी अस्मि। अद्य कथं साहाय्यं करवाणि?",
        sample_anc_phrase="लाभार्थी कल्याणी BEN-SA-001, गर्भिणी परीक्षणम्, भारः ५२ कि.ग्रा., टीटी सूचीवेधः दत्तः।",
        sample_danger_phrase="गर्भावस्थायां तीव्रः रक्तस्रावः भवति, शीघ्रमतिशीघ्रं चिकित्सालयं नयन्तु।",
        sample_query_phrase="कल्याण्याः पूर्वतनं स्वास्थ्यविवरणं दर्शयतु।"
    ),
    "sat": IndicLanguageInfo(
        code="sat",
        name_en="Santali",
        name_native="ᱥᱟᱱᱛᱟᱲᱤ",
        script="Ol Chiki",
        bcp47="sat-IN",
        dir="ltr",
        region="Jharkhand, Odisha, West Bengal",
        sample_greeting="ᱡᱚᱦᱟᱨ ᱟᱥᱟ ᱫᱟᱹᱭ, ᱤᱧ ᱫᱚ ᱟᱥᱟ ᱥᱟᱹᱠᱷᱤ ᱠᱟᱹᱱᱟᱹᱧ᱾ ᱛᱮᱦᱮᱧ ᱪᱮᱫ ᱜᱚᱲᱚᱧ ᱮᱢ ᱫᱟᱲᱮᱭᱟᱜ-ᱟ?",
        sample_anc_phrase="ᱵᱮᱱᱤᱯᱷᱤᱥᱤᱭᱟᱨᱤ ᱢᱟᱞᱚᱛᱤ BEN-ST-001, ANC ᱯᱚᱨᱤᱠᱷᱟ, ᱦᱟᱢᱟᱞ 50 kg, TT ᱴᱤᱠᱟᱹ ᱮᱢ ᱦᱩᱭ ᱮᱱᱟ᱾",
        sample_danger_phrase="ᱦᱚᱲᱢᱚ ᱨᱮ ᱟᱹᱰᱤ ᱢᱟᱭᱟᱢ ᱞᱤᱸᱜᱤᱱ ᱠᱟᱱᱟ, ᱞᱚᱜᱚᱱ ᱦᱟᱥᱯᱟᱛᱟᱞ ᱤᱫᱤ ᱦᱩᱭᱩᱜ-ᱟ᱾",
        sample_query_phrase="ᱢᱟᱞᱚᱛᱤ ᱭᱟᱜ ᱢᱟᱬᱟᱝ ᱨᱮᱠᱚᱨᱰ ᱩᱫᱩᱜ ᱢᱮ᱾"
    ),
    "sd": IndicLanguageInfo(
        code="sd",
        name_en="Sindhi",
        name_native="سنڌي / सिंधी",
        script="Perso-Arabic / Devanagari",
        bcp47="sd-IN",
        dir="rtl",
        region="Gujarat, Rajasthan, Maharashtra",
        sample_greeting="سلام آشا ڀيڻ، مان آشا سکي آهيان. اڄ آءٌ توهان جي ڇا مدد ڪري سگهان ٿي؟",
        sample_anc_phrase="فائديمند مينا BEN-SD-001، ANC چڪاس، وزن 52 ڪلو، TT ٽڪو ڏنو ويو، IFA گوريون ڏنيون.",
        sample_danger_phrase="حمل دوران تمام گهڻو رت وهندو رهيو آهي، فوري طور تي اسپتال وٺي وڃو.",
        sample_query_phrase="مينا جو اڳوڻو رڪارڊ ڏيکاريو."
    ),
    "ta": IndicLanguageInfo(
        code="ta",
        name_en="Tamil",
        name_native="தமிழ்",
        script="Tamil",
        bcp47="ta-IN",
        dir="ltr",
        region="Tamil Nadu, Puducherry",
        sample_greeting="வணக்கம் ஆஷா அவர்களே, நான் ஆஷா சகி. இன்று நான் உங்களுக்கு எவ்வாறு உதவட்டும்?",
        sample_anc_phrase="பயனாளி பிரியா BEN-TA-001, ANC பரிசோதனை, எடை 53 கிலோ, TT ஊசி போடப்பட்டது, IFA மாத்திரைகள் வழங்கப்பட்டது.",
        sample_danger_phrase="கர்ப்ப காலத்தில் அதிக இரத்தப்போக்கு மற்றும் மயக்கம் உள்ளது, உடனே 108 ஆம்புலன்ஸில் மருத்துவமனைக்கு அழைத்து செல்லுங்கள்.",
        sample_query_phrase="பிரியாவின் முந்தைய பரிசோதனை விவரங்களைக் காட்டுங்கள்."
    ),
    "te": IndicLanguageInfo(
        code="te",
        name_en="Telugu",
        name_native="తెలుగు",
        script="Telugu",
        bcp47="te-IN",
        dir="ltr",
        region="Andhra Pradesh, Telangana",
        sample_greeting="నమస్కారం ఆశా గారూ, నేను ఆశా సఖిని. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?",
        sample_anc_phrase="లబ్ధిదారుడు లక్ష్మి BEN-TE-001, ANC పరీక్ష మూడో నెల, బరువు 54 కేజీలు, TT ఇంజెక్షన్ ఇచ్చాము, IFA మాత్రలు ఇచ్చాము.",
        sample_danger_phrase="గర్భధారణ సమయంలో తీవ్ర రక్తస్రావం మరియు తలనొప్పి ఉంది, వెంటనే 108 అంబులెన్స్ ద్వారా పీహెచ్‌సీకి తీసుకెళ్లండి.",
        sample_query_phrase="లక్ష్మి యొక్క మునుపటి చెకప్ వివరాలను చూపించండి."
    ),
    "ur": IndicLanguageInfo(
        code="ur",
        name_en="Urdu",
        name_native="اردو",
        script="Perso-Arabic",
        bcp47="ur-IN",
        dir="rtl",
        region="Pan-India, Telangana, UP, Bihar, J&K",
        sample_greeting="السلام علیکم آشا باجی، میں آشا سکھی ہوں۔ آج میں آپ کی کیا مدد کر سکتی ہوں؟",
        sample_anc_phrase="مستفید پروین BEN-UR-001، ANC معائنہ تیسرا مہینہ، وزن 53 کلوگرام، TT انجیکشن دیا گیا، IFA گولیاں دی گئیں۔",
        sample_danger_phrase="حمل کے دوران شدید خون بہہ رہا ہے اور چکر آ رہے ہیں، فوراً 108 ایمبولینس بلا کر ہسپتال لے جائیں۔",
        sample_query_phrase="پروین کے پچھلے معائنے کی تفصیلات دکھائیں۔"
    ),
}


def get_language_info(lang_code: str) -> IndicLanguageInfo:
    """Returns Language specification, falling back to Kannada if unknown."""
    normalized = lang_code.lower().split("-")[0].strip()
    return INDIC_LANGUAGES.get(normalized, INDIC_LANGUAGES["kn"])


def is_rtl_language(lang_code: str) -> bool:
    """Returns True if the language is right-to-left (Urdu, Kashmiri, Sindhi)."""
    info = get_language_info(lang_code)
    return info.dir == "rtl"
