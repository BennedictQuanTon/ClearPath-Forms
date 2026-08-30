export interface GlossaryEntry {
  plainLanguage: string;
  example: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  full_name: {
    plainLanguage:
      "Your name as it appears on a government ID — first, middle if you use it, and last name.",
    example: "Maria Elena Santos",
  },
  date_of_birth: {
    plainLanguage: "The day you were born, using year-month-day so it is not confused with other date formats.",
    example: "1990-03-04",
  },
  street_address: {
    plainLanguage: "The street number and street name where you live now. Do not use a P.O. box if you have a street address.",
    example: "12 Elm Street, Apt 3B",
  },
  city: {
    plainLanguage: "The city or town of your current home.",
    example: "Oakland",
  },
  state: {
    plainLanguage: "The two-letter U.S. state abbreviation, or the full state name.",
    example: "CA",
  },
  zip: {
    plainLanguage: "The five-digit ZIP code for your current home.",
    example: "94612",
  },
  phone: {
    plainLanguage: "A phone number we could use to reach you. Digits only or with dashes are both fine.",
    example: "510-555-0142",
  },
  email: {
    plainLanguage: "An email address you can check. This mock form does not send mail.",
    example: "maria.santos@example.com",
  },
  household_composition: {
    plainLanguage:
      "A short label for who lives with you. It is not a legal test — pick the option that most closely matches your home. 'Family with children' means at least one person under 18 lives there.",
    example: "family_with_children",
  },
  household_size: {
    plainLanguage:
      "Count everyone who lives in the home most of the time, including you. Do not count people who only visit.",
    example: "4",
  },
  dependents_under_18: {
    plainLanguage: "How many people in that household count are children under 18. Use 0 if none.",
    example: "2",
  },
  lives_with_others: {
    plainLanguage:
      "Whether anyone else helps pay rent, mortgage, or utilities. Roommates who split rent count as yes.",
    example: "yes",
  },
  employment_status: {
    plainLanguage: "How you get most of your work-related income right now — or that you are not working.",
    example: "employed",
  },
  employer_name: {
    plainLanguage:
      "The company or business that pays you. Required if you are employed or self-employed. Skip if you are not working.",
    example: "Oakland Community Clinic",
  },
  monthly_income: {
    plainLanguage:
      "About how much money you take home from work in a typical month, after taxes. Use 0 if you have no job income.",
    example: "2400",
  },
  other_monthly_income: {
    plainLanguage:
      "Money that is not a paycheck: child support, unemployment, gifts you can count on, and similar. Use 0 if none.",
    example: "150",
  },
  receives_other_benefits: {
    plainLanguage:
      "Whether you already get help such as SNAP, SSI, Medicaid, or housing assistance. This mock form does not check any database.",
    example: "no",
  },
  identity_ready: {
    plainLanguage:
      "A stand-in for uploading a photo ID. Nothing is uploaded. Check yes if you would have an ID available in a real application.",
    example: "true",
  },
  income_proof_ready: {
    plainLanguage:
      "A stand-in for pay stubs or a benefits letter. Nothing is uploaded. Check yes if you would have proof available.",
    example: "true",
  },
  attestation: {
    plainLanguage:
      "A practice-form promise that you understand this is not a real government filing and no personal data is sent to an agency.",
    example: "true",
  },
};
