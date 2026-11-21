import sys
sys.path.insert(0, 'backend')
from app.services.sakhi_assistant import sakhi_assistant

questions = [
    (1, 'Show all pregnant women in my assigned area.', 'en', 'SHOW_PREGNANCY_RECORDS'),
    (2, 'Which beneficiaries need ANC follow-up?', 'en', 'CHECK_ANC_FOLLOWUPS'),
    (3, 'Show high-risk pregnancy cases.', 'en', 'FIND_HIGH_RISK_CASES'),
    (4, 'Show children with overdue vaccinations.', 'en', 'SHOW_OVERDUE_VACCINATIONS'),
    (5, 'Plan my household visits for today.', 'en', 'PLAN_HOUSEHOLD_VISITS'),
    (6, 'Generate my daily fieldwork report.', 'en', 'GENERATE_DAILY_REPORT'),
    (7, 'Show pending referrals.', 'en', 'SHOW_PENDING_REFERRALS'),
    (8, 'Track ambulance 108.', 'en', 'TRACK_AMBULANCE'),
    (9, 'Explain PMMVY.', 'en', 'EXPLAIN_GOVERNMENT_SCHEME'),
    (10, 'Translate this instruction into Kannada.', 'en', 'TRANSLATE_HEALTH_INSTRUCTIONS'),
    (11, 'Register a new beneficiary.', 'en', 'REGISTER_BENEFICIARY'),
    (12, 'Show my pending tasks.', 'en', 'SHOW_PENDING_VISITS'),
    # Kannada
    (13, 'ನನ್ನ ವ್ಯಾಪ್ತಿಯ ಎಲ್ಲಾ ಗರ್ಭಿಣಿಯರನ್ನು ತೋರಿಸಿ.', 'kn', 'SHOW_PREGNANCY_RECORDS'),
    (14, 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ಗರ್ಭಾವಸ್ಥೆ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ.', 'kn', 'FIND_HIGH_RISK_CASES'),
    (15, '108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.', 'kn', 'TRACK_AMBULANCE'),
    # Hindi
    (16, 'उच्च जोखिम वाले गर्भावस्था मामले दिखाएं।', 'hi', 'FIND_HIGH_RISK_CASES'),
    (17, '108 एम्बुलेंस को ट्रैक करें।', 'hi', 'TRACK_AMBULANCE'),
]

failed = False
for num, q, lang, exp_intent in questions:
    res = sakhi_assistant.process_query(q, lang)
    intent = res['intent']
    disp = res.get('display_text', '')
    records = res.get('records', [])
    
    # Verify no lakshmamma false flag
    has_lakshmamma = 'lakshmamma' in disp.lower() or 'ಲಕ್ಷ್ಮಮ್ಮ' in disp
    is_laksh_query = 'lakshmamma' in q.lower() or 'ಲಕ್ಷ್ಮಮ್ಮ' in q
    
    passed = (intent == exp_intent) and (not has_lakshmamma or is_laksh_query)
    if not passed:
        failed = True
        print(f"FAIL [{num}] ({lang}) '{q}' -> got '{intent}' (expected '{exp_intent}'), laksh={has_lakshmamma}")
    else:
        disp_clean = disp.replace('\n', ' ')[:65]
        print(f"PASS [{num:02d}] [{lang.upper()}] Intent: {intent:<25} | Count: {str(res.get('count')):<3} | {disp_clean}...")

if not failed:
    print('\nALL 17 TESTS PASSED PERFECTLY WITH ZERO LAKSHMAMMA BIAS!')
else:
    print('\nSOME TESTS FAILED!')
