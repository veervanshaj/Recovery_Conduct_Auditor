export const DEFAULT_COMPLIANCE_RULES = [
  {
    rule_id: 'RULE_CALLING_HOURS',
    rule_name: 'Permitted Calling Hours Window',
    rule_category: 'calling_hours',
    description: 'Borrowers must only be contacted within statutory hours (08:00 AM to 07:00 PM local time). Calls outside this window constitute harassment.',
    regulatory_reference: 'RBI Master Direction - Recovery Agents / Fair Practices Code Section 4.2',
    parameters: {
      permitted_hours_start: '08:00',
      permitted_hours_end: '19:00',
      max_calls_per_borrower_per_day: 3,
      min_interval_minutes: 120,
      max_calls_per_week: 10
    },
    severity: 'high',
    is_active: true
  },
  {
    rule_id: 'RULE_CALL_FREQUENCY_SPIKE',
    rule_name: 'Excessive Daily Call Frequency',
    rule_category: 'call_frequency',
    description: 'No more than 3 calls may be placed to a borrower on a single calendar day, regardless of call connection status.',
    regulatory_reference: 'IBA Code of Conduct for Direct Recovery Agents Clause 3',
    parameters: {
      permitted_hours_start: '08:00',
      permitted_hours_end: '19:00',
      max_calls_per_borrower_per_day: 3,
      min_interval_minutes: 120,
      max_calls_per_week: 10
    },
    severity: 'high',
    is_active: true
  },
  {
    rule_id: 'RULE_CALL_INTERVAL_PERSISTENCE',
    rule_name: 'Aggressive Call Repetition Interval',
    rule_category: 'call_frequency',
    description: 'Consecutive calls to the same borrower within 120 minutes of a previous attempt are classified as persistent pressure tactics.',
    regulatory_reference: 'Fair Debt Collection Practices & RBI Guidelines',
    parameters: {
      permitted_hours_start: '08:00',
      permitted_hours_end: '19:00',
      max_calls_per_borrower_per_day: 3,
      min_interval_minutes: 120,
      max_calls_per_week: 10
    },
    severity: 'medium',
    is_active: true
  },
  {
    rule_id: 'RULE_THIRD_PARTY_INTIMIDATION',
    rule_name: 'Prohibition on Third-Party Contact / Employer Threats',
    rule_category: 'contact_parties',
    description: 'Threatening to contact or contacting a borrower\'s employer, colleagues, family members, or acquaintances for debt recovery is strictly prohibited.',
    regulatory_reference: 'RBI Notification - Recovery Agents - Conduct Standards (August 2022)',
    parameters: {
      permitted_hours_start: '08:00',
      permitted_hours_end: '19:00',
      max_calls_per_borrower_per_day: 3,
      min_interval_minutes: 120,
      max_calls_per_week: 10
    },
    severity: 'critical',
    is_active: true
  }
];
