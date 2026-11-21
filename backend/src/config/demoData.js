export const getDemoScenarios = () => [
  {
    call: {
      call_id: 'DEMO-CALL-001',
      agent_id: 'AGENT-104 (Priya Sharma)',
      borrower_id: 'BORROWER-789 (Rahul Verma)',
      original_filename: 'demo_scenario_1_compliant_recovery.wav',
      audio_file_path: 'uploads/demo_scenario_1_compliant_recovery.wav',
      audio_url: '/uploads/demo_scenario_1_compliant_recovery.wav',
      duration: 52.0,
      sample_rate: 16000,
      channels: 1,
      analysis_status: 'completed',
      overall_risk_level: 'low',
      risk_score: 12,
      risk_reasons: [
        'Professional tone maintained throughout call interaction',
        'No vocal energy spikes detected beyond nominal speech threshold',
        'Standard identification and payment schedule discussed in accordance with Fair Practices Code'
      ],
      call_summary: 'Compliant repayment discussion. Agent identified themselves respectfully, inquired about overdue instalment on Personal Loan account, and agreed to follow up after 48 hours following borrower explanation.',
      metrics: {
        talk_time_agent_sec: 28.5,
        talk_time_borrower_sec: 20.1,
        silence_duration_sec: 3.4,
        total_pauses_count: 1,
        dsp_events_count: 1,
        flagged_segments_count: 0
      },
      review_status: 'cleared',
      is_demo: true,
      demo_scenario: 'Scenario 1: Normal Recovery Conversation (Compliant)'
    },
    transcript: [
      { start_time: 0.0, end_time: 5.2, speaker: 'AGENT_1', text: 'Good morning Mr. Verma, this is Priya calling on behalf of Apex Financial Services regarding your loan account.' },
      { start_time: 5.8, end_time: 11.5, speaker: 'BORROWER_1', text: 'Yes hello Priya, I received your SMS reminder yesterday.' },
      { start_time: 12.0, end_time: 19.8, speaker: 'AGENT_1', text: 'Thank you for acknowledging. We noticed the EMI due on the 5th has not cleared yet. Could you help us understand the status?' },
      { start_time: 20.4, end_time: 29.2, speaker: 'BORROWER_1', text: 'My salary got delayed this month due to an audit at our company. It will be credited by Friday morning for sure.' },
      { start_time: 29.8, end_time: 38.6, speaker: 'AGENT_1', text: 'I understand Mr. Verma. I will update our records that payment will be processed by Friday the 24th. You can also pay via the online link.' },
      { start_time: 39.2, end_time: 44.0, speaker: 'BORROWER_1', text: 'Yes, I will use UPI as soon as salary reflects. Thank you for your patience.' },
      { start_time: 44.5, end_time: 51.5, speaker: 'AGENT_1', text: 'You are welcome Mr. Verma. Have a good day. Thank you for banking with us.' }
    ],
    audio_events: [
      {
        start_time: 20.0,
        end_time: 23.5,
        event_type: 'long_pause',
        severity: 'informational',
        duration: 3.5,
        measured_features: { silence_ratio: 0.88 },
        description: 'Natural conversational pause while agent checks loan portal records.'
      }
    ],
    flagged_segments: [],
    reviews: [
      {
        reviewer_id: 'SENIOR_AUDITOR_MEHTA',
        review_status: 'cleared',
        reviewer_notes: 'Standard polite repayment inquiry. Full compliance with RBI Fair Practice code.',
        action_taken: 'Marked compliant in monthly audit batch.'
      }
    ]
  },
  {
    call: {
      call_id: 'DEMO-CALL-002',
      agent_id: 'AGENT-312 (Vikram Malhotra)',
      borrower_id: 'BORROWER-452 (Amit Sen)',
      original_filename: 'demo_scenario_2_intimidation_threat.wav',
      audio_file_path: 'uploads/demo_scenario_2_intimidation_threat.wav',
      audio_url: '/uploads/demo_scenario_2_intimidation_threat.wav',
      duration: 68.0,
      sample_rate: 16000,
      channels: 1,
      analysis_status: 'completed',
      overall_risk_level: 'high',
      risk_score: 88,
      risk_reasons: [
        'Threat to contact borrower\'s workplace/employer detected (RBI Fair Practices Code Section 4.2 violation)',
        'Significant acoustic loudness increase (+8.4 dB over baseline) aligned with demanding utterance',
        'Vocal pitch surge (+112 Hz shift) coinciding with intimidating statements',
        'Extended 7.8-second pressure pause following explicit workplace escalation threat'
      ],
      call_summary: 'High-severity compliance violation. Agent exhibited aggressive vocal elevation and explicitly threatened to contact the borrower\'s employer and HR department if payment was not transferred immediately, followed by an extended pressure silence.',
      metrics: {
        talk_time_agent_sec: 41.2,
        talk_time_borrower_sec: 14.8,
        silence_duration_sec: 12.0,
        total_pauses_count: 2,
        dsp_events_count: 4,
        flagged_segments_count: 2
      },
      review_status: 'escalated',
      is_demo: true,
      demo_scenario: 'Scenario 2: Potentially Intimidating Conversation (High Priority Review)'
    },
    transcript: [
      { start_time: 0.0, end_time: 6.0, speaker: 'AGENT_1', text: 'Amit Sen? This is Vikram Malhotra from Recovery Operations. Your loan payment is overdue by 12 days.' },
      { start_time: 6.5, end_time: 14.2, speaker: 'BORROWER_1', text: 'Yes sir, I know. I had a medical emergency in my family last week, my mother was hospitalized.' },
      { start_time: 14.8, end_time: 21.0, speaker: 'AGENT_1', text: 'I don\'t want to hear excuses. The system will mark you as a chronic defaulter today unless paid in one hour.' },
      { start_time: 21.5, end_time: 28.5, speaker: 'BORROWER_1', text: 'Sir please, I just need two more days until Friday. I will definitely arrange the money.' },
      { start_time: 29.0, end_time: 37.5, speaker: 'AGENT_1', text: 'I don\'t care! Pay today! If you don\'t pay by 3 PM, we will call your office reception and report your default to your HR!' },
      { start_time: 37.5, end_time: 45.3, speaker: 'PAUSE', text: '[7.8s silence - borrower under duress]' },
      { start_time: 45.4, end_time: 55.0, speaker: 'BORROWER_1', text: 'Please don\'t do that sir... please don\'t involve my company or employer. I will lose my job. I will try to borrow from someone today.' },
      { start_time: 55.5, end_time: 65.2, speaker: 'AGENT_1', text: 'You better arrange it before 3 PM or see what happens to your reputation at work.' }
    ],
    audio_events: [
      {
        start_time: 29.0,
        end_time: 37.5,
        event_type: 'loudness_increase',
        severity: 'high',
        duration: 8.5,
        measured_features: { rms_peak: 0.384, rms_relative_ratio: 3.42 },
        description: 'Sudden loudness increase of +8.4 dB relative to agent baseline vocal energy'
      },
      {
        start_time: 29.0,
        end_time: 37.5,
        event_type: 'pitch_variation',
        severity: 'high',
        duration: 8.5,
        measured_features: { pitch_hz: 284, pitch_relative_shift_semitones: 5.6 },
        description: 'Vocal fundamental pitch elevated from 172 Hz to 284 Hz (+112 Hz shift)'
      },
      {
        start_time: 37.5,
        end_time: 45.3,
        event_type: 'long_pause',
        severity: 'medium',
        duration: 7.8,
        measured_features: { silence_ratio: 0.94 },
        description: '7.8-second silence immediately following employer threat'
      },
      {
        start_time: 55.5,
        end_time: 65.2,
        event_type: 'spectral_strain',
        severity: 'medium',
        duration: 9.7,
        measured_features: { spectral_centroid: 2480 },
        description: 'High spectral centroid indicating sustained tense vocal strain'
      }
    ],
    flagged_segments: [
      {
        start_time: 29.0,
        end_time: 37.5,
        category: 'third_party_threat_employer_family',
        severity: 'critical',
        transcript_excerpt: 'I don\'t care! Pay today! If you don\'t pay by 3 PM, we will call your office reception and report your default to your HR!',
        speaker: 'AGENT_1',
        language_evidence: 'Direct threat to contact third-party employer (HR department & office reception) and damage borrower standing.',
        audio_evidence: [
          'Vocal loudness surged by +8.4 dB (3.42x baseline RMS)',
          'Pitch F0 surged to 284 Hz (elevated vocal intensity)'
        ],
        context: 'Borrower had explained family medical emergency and pleaded for a two-day extension.',
        reason_for_flag: 'Critical violation of statutory debt recovery guidelines prohibiting threats to contact employers or humiliate borrowers.',
        confidence: 'high',
        recommended_action: 'Immediate escalation to Compliance Committee; initiate formal inquiry under agent conduct protocol.'
      },
      {
        start_time: 37.5,
        end_time: 55.0,
        category: 'unreasonable_pressure_tactic',
        severity: 'high',
        transcript_excerpt: '[7.8s Silence] followed by borrower: "Please don\'t involve my company or employer. I will lose my job."',
        speaker: 'BORROWER_1',
        language_evidence: 'Borrower visibly frightened of career termination following intimidation tactic.',
        audio_evidence: [
          '7.8s pause demonstrates intimidation duress context rather than technical latency'
        ],
        context: 'Direct psychological pressure leveraged immediately following explicit workplace threat.',
        reason_for_flag: 'Unreasonable psychological pressure tactic evidenced by conversational distress reaction.',
        confidence: 'high',
        recommended_action: 'Flag agent interaction history for pattern of workplace intimidation.'
      }
    ],
    reviews: [
      {
        reviewer_id: 'COMPLIANCE_HEAD_SINGH',
        review_status: 'escalated',
        reviewer_notes: 'Confirmed prohibited third-party employer threat backed by aggressive vocal elevation. Case forwarded to HR and Legal for disciplinary notice.',
        action_taken: 'Agent suspended from outbound calling pending disciplinary hearing.'
      }
    ]
  },
  {
    call: {
      call_id: 'DEMO-CALL-003',
      agent_id: 'AGENT-209 (Kavita Roy)',
      borrower_id: 'BORROWER-115 (Sunita Nair)',
      original_filename: 'demo_scenario_3_repeated_pattern.wav',
      audio_file_path: 'uploads/demo_scenario_3_repeated_pattern.wav',
      audio_url: '/uploads/demo_scenario_3_repeated_pattern.wav',
      duration: 45.0,
      sample_rate: 16000,
      channels: 1,
      analysis_status: 'completed',
      overall_risk_level: 'high',
      risk_score: 76,
      risk_reasons: [
        'Persistent call pattern violation: 6 contact attempts logged within 8 hours to same borrower',
        'Prohibited calling hours violation: Call placed at 07:15 AM (before statutory 08:00 AM window)',
        'Rapid call repetition: Consecutive calls placed within 18 minutes cooldown interval',
        'Moderate persistent pressure language identified during dialogue'
      ],
      call_summary: 'Call-pattern compliance violation. While spoken language avoided overt profanity, call metadata analysis reveals excessive repeated calls to the borrower starting before permitted statutory hours (7:15 AM), violating harassment frequency limits.',
      metrics: {
        talk_time_agent_sec: 26.0,
        talk_time_borrower_sec: 14.5,
        silence_duration_sec: 4.5,
        total_pauses_count: 1,
        dsp_events_count: 2,
        flagged_segments_count: 1
      },
      review_status: 'under_investigation',
      is_demo: true,
      demo_scenario: 'Scenario 3: Repeated Contact Pattern & Early Calling Hours (High Priority Review)'
    },
    transcript: [
      { start_time: 0.0, end_time: 6.5, speaker: 'BORROWER_1', text: 'Hello? Why are you calling me so early in the morning? It is barely 7:15 AM!' },
      { start_time: 7.0, end_time: 14.8, speaker: 'AGENT_1', text: 'Mrs. Nair, because you were not picking up my previous calls yesterday evening or at 6:45 AM today.' },
      { start_time: 15.2, end_time: 22.0, speaker: 'BORROWER_1', text: 'You have called me five times since yesterday! I told you I am transferring the instalment at 10 AM when bank opens.' },
      { start_time: 22.5, end_time: 31.0, speaker: 'AGENT_1', text: 'We have to call until payment is verified in our system. You cannot expect us to wait indefinitely.' },
      { start_time: 31.5, end_time: 38.0, speaker: 'BORROWER_1', text: 'Please stop calling my number every 20 minutes. I will pay at 10 AM.' },
      { start_time: 38.5, end_time: 44.5, speaker: 'AGENT_1', text: 'Alright, we will check at 10 AM sharp. If not received, calls will resume.' }
    ],
    audio_events: [
      {
        start_time: 0.0,
        end_time: 6.5,
        event_type: 'loudness_increase',
        severity: 'medium',
        duration: 6.5,
        measured_features: { rms_peak: 0.28, rms_relative_ratio: 2.1 },
        description: 'Borrower agitated vocal elevation due to sleep disruption and repeated calling'
      },
      {
        start_time: 22.5,
        end_time: 31.0,
        event_type: 'spectral_strain',
        severity: 'low',
        duration: 8.5,
        measured_features: { spectral_centroid: 2100 },
        description: 'Persistent clipped delivery style by agent'
      }
    ],
    flagged_segments: [
      {
        start_time: 0.0,
        end_time: 14.8,
        category: 'prohibited_calling_hour',
        severity: 'high',
        transcript_excerpt: 'Borrower: "Why are you calling me so early... barely 7:15 AM!" Agent: "...because you were not picking up... at 6:45 AM today."',
        speaker: 'AGENT_1',
        language_evidence: 'Dialogue explicitly references call placed before 7:00 AM and current call at 7:15 AM, corroborating metadata violation.',
        audio_evidence: ['Audible borrower distress resulting from early morning disruption.'],
        context: 'Statutory rules strictly prohibit recovery calls before 08:00 AM or after 07:00 PM.',
        reason_for_flag: 'Direct violation of permitted calling window combined with rapid repetition harassment.',
        confidence: 'high',
        recommended_action: 'Audit auto-dialer schedule and sanction agent for manual out-of-hours dialing.'
      }
    ],
    reviews: [
      {
        reviewer_id: 'COMPLIANCE_OFFICER_2',
        review_status: 'under_investigation',
        reviewer_notes: 'Pattern analysis confirmed 6 calls within 8 hours and 2 out-of-hours calls. Auto-dialer configuration error suspected.',
        action_taken: 'Temporarily blocked borrower phone number in dialer pool pending audit.'
      }
    ]
  }
];
