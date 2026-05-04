'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'

const API = 'https://lexindia-backend-production.up.railway.app'

function LogoMark({ size = 24, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="1" width="5" height="5" rx="1" fill={color} opacity="0.25"/>
      <rect x="4" y="7" width="5" height="5" rx="1" fill={color} opacity="0.45"/>
      <rect x="4" y="13" width="5" height="5" rx="1" fill={color} opacity="0.65"/>
      <rect x="4" y="19" width="5" height="5" rx="1" fill={color} opacity="0.85"/>
      <rect x="4" y="25" width="5" height="5" rx="1" fill={color}/>
      <rect x="12" y="7" width="5" height="5" rx="1" fill={color} opacity="0.25"/>
      <rect x="12" y="13" width="5" height="5" rx="1" fill={color} opacity="0.5"/>
      <rect x="12" y="19" width="5" height="5" rx="1" fill={color} opacity="0.8"/>
      <rect x="12" y="25" width="5" height="5" rx="1" fill={color}/>
      <rect x="20" y="25" width="5" height="5" rx="1" fill={color} opacity="0.6"/>
      <rect x="27" y="25" width="5" height="5" rx="1" fill={color} opacity="0.3"/>
    </svg>
  )
}

type Field = { key: string; label: string; placeholder: string; type?: 'text' | 'textarea' | 'date'; required?: boolean }

type DocType = {
  name: string
  fields: Field[]
}

type Category = {
  name: string
  color: string
  docs: DocType[]
}

const CATEGORIES: Category[] = [
  {
    name: 'Criminal',
    color: '#ef4444',
    docs: [
      {
        name: 'Regular Bail Application (S.483 BNSS)',
        fields: [
          { key: 'court', label: 'Court Name', placeholder: 'e.g. Sessions Court, New Delhi', required: true },
          { key: 'accused', label: 'Accused / Applicant Name', placeholder: 'e.g. Ramesh Kumar S/o Suresh Kumar', required: true },
          { key: 'state', label: 'State (Respondent)', placeholder: 'e.g. State of Delhi' },
          { key: 'fir_no', label: 'FIR No. & Police Station', placeholder: 'e.g. FIR No. 123/2024, PS Connaught Place' },
          { key: 'sections', label: 'Sections Charged', placeholder: 'e.g. S.103 BNS (Murder), S.61 BNSS' },
          { key: 'arrest_date', label: 'Date of Arrest', placeholder: 'e.g. 1st January 2025', type: 'text' },
          { key: 'facts', label: 'Brief Facts of Arrest', placeholder: 'Describe the circumstances of arrest and the alleged offence...', type: 'textarea', required: true },
          { key: 'grounds', label: 'Grounds for Bail', placeholder: 'e.g. Applicant is innocent, false implication, no prior criminal record, cooperative with investigation...', type: 'textarea' },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'e.g. Adv. Priya Sharma' },
        ]
      },
      {
        name: 'Anticipatory Bail Application (S.482 BNSS)',
        fields: [
          { key: 'court', label: 'Court Name', placeholder: 'e.g. Sessions Court / High Court', required: true },
          { key: 'applicant', label: 'Applicant Name', placeholder: 'Full name', required: true },
          { key: 'state', label: 'State (Respondent)', placeholder: 'e.g. State of Delhi' },
          { key: 'fir_no', label: 'FIR No. / Complaint Details', placeholder: 'FIR No. or complaint reference (if any)' },
          { key: 'sections', label: 'Sections (Apprehended)', placeholder: 'e.g. S.318 BNS (Cheating)' },
          { key: 'facts', label: 'Facts & Apprehension of Arrest', placeholder: 'Explain why arrest is apprehended and the background...', type: 'textarea', required: true },
          { key: 'grounds', label: 'Grounds', placeholder: 'Clean antecedents, no flight risk, willing to cooperate...', type: 'textarea' },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name' },
        ]
      },
      {
        name: 'Quashing Petition (S.528 BNSS)',
        fields: [
          { key: 'court', label: 'High Court', placeholder: 'e.g. High Court of Delhi', required: true },
          { key: 'petitioner', label: 'Petitioner Name', placeholder: 'Name', required: true },
          { key: 'respondents', label: 'Respondents', placeholder: 'e.g. State of Delhi & Anr.' },
          { key: 'fir_details', label: 'FIR / Case Details', placeholder: 'FIR No., PS, Sections, Court where pending' },
          { key: 'facts', label: 'Facts', placeholder: 'Background facts of the FIR/complaint...', type: 'textarea', required: true },
          { key: 'grounds', label: 'Grounds for Quashing', placeholder: 'No prima facie case, abuse of process, settlement between parties...', type: 'textarea' },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name' },
        ]
      },
      {
        name: 'Legal Notice (S.138 NI Act - Cheque Bounce)',
        fields: [
          { key: 'sender', label: 'From (Sender / Complainant)', placeholder: 'Full name and address', required: true },
          { key: 'recipient', label: 'To (Accused)', placeholder: 'Full name and address', required: true },
          { key: 'cheque_no', label: 'Cheque Details', placeholder: 'Cheque No., Date, Amount, Bank & Branch', required: true },
          { key: 'dishonour_date', label: 'Date of Dishonour', placeholder: 'Date when cheque was returned' },
          { key: 'reason', label: 'Reason for Dishonour', placeholder: 'e.g. Insufficient funds / Account closed' },
          { key: 'demand', label: 'Amount Demanded', placeholder: 'Total amount including interest' },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name' },
        ]
      },
    ]
  },
  {
    name: 'Corporate & Company Law',
    color: '#6366f1',
    docs: [
      {
        name: 'Board Resolution',
        fields: [
          { key: 'company', label: 'Company Name', placeholder: 'e.g. ABC Private Limited', required: true },
          { key: 'cin', label: 'CIN', placeholder: 'e.g. U74999DL2020PTC123456' },
          { key: 'meeting_date', label: 'Date of Meeting', placeholder: 'e.g. 1st May 2026', required: true },
          { key: 'meeting_place', label: 'Place of Meeting', placeholder: 'e.g. Registered Office, New Delhi' },
          { key: 'directors', label: 'Directors Present', placeholder: 'List of directors with DINs' },
          { key: 'resolution_subject', label: 'Subject of Resolution', placeholder: 'e.g. Opening of bank account / Appointment of auditor', required: true },
          { key: 'resolution_details', label: 'Resolution Details', placeholder: 'Specific details and authorizations...', type: 'textarea', required: true },
          { key: 'cs_name', label: 'Company Secretary Name', placeholder: 'CS Name (if applicable)' },
        ]
      },
      {
        name: 'Non-Disclosure Agreement (NDA)',
        fields: [
          { key: 'party1', label: 'Disclosing Party', placeholder: 'Company/Person name and address', required: true },
          { key: 'party2', label: 'Receiving Party', placeholder: 'Company/Person name and address', required: true },
          { key: 'purpose', label: 'Purpose of Disclosure', placeholder: 'e.g. Evaluation of potential business partnership', required: true },
          { key: 'confidential_info', label: 'Nature of Confidential Information', placeholder: 'e.g. Financial data, trade secrets, technical know-how' },
          { key: 'term', label: 'Term of Agreement', placeholder: 'e.g. 2 years from execution' },
          { key: 'governing_law', label: 'Governing Law / Jurisdiction', placeholder: 'e.g. Laws of India, Courts of Delhi' },
        ]
      },
      {
        name: 'Employment Agreement',
        fields: [
          { key: 'employer', label: 'Employer (Company)', placeholder: 'Company name and address', required: true },
          { key: 'employee', label: 'Employee Name', placeholder: 'Full name', required: true },
          { key: 'designation', label: 'Designation / Role', placeholder: 'e.g. Senior Software Engineer', required: true },
          { key: 'ctc', label: 'CTC / Compensation', placeholder: 'e.g. ₹12,00,000 per annum' },
          { key: 'joining_date', label: 'Joining Date', placeholder: 'e.g. 1st June 2026' },
          { key: 'probation', label: 'Probation Period', placeholder: 'e.g. 6 months' },
          { key: 'notice_period', label: 'Notice Period', placeholder: 'e.g. 2 months' },
          { key: 'work_location', label: 'Work Location', placeholder: 'e.g. New Delhi / Remote' },
          { key: 'special_terms', label: 'Special Terms', placeholder: 'Non-compete, IP assignment, other special conditions...', type: 'textarea' },
        ]
      },
      {
        name: 'Partnership Deed',
        fields: [
          { key: 'firm_name', label: 'Firm Name', placeholder: 'e.g. M/s ABC & Associates', required: true },
          { key: 'partners', label: 'Partners Details', placeholder: 'Name, address, and share of each partner', required: true, type: 'textarea' },
          { key: 'business', label: 'Nature of Business', placeholder: 'e.g. Legal services / Trading / Manufacturing', required: true },
          { key: 'capital', label: 'Capital Contribution', placeholder: 'Capital contributed by each partner' },
          { key: 'profit_ratio', label: 'Profit/Loss Sharing Ratio', placeholder: 'e.g. 50:50 or 60:40' },
          { key: 'commencement', label: 'Date of Commencement', placeholder: 'e.g. 1st April 2026' },
          { key: 'address', label: 'Principal Place of Business', placeholder: 'Complete address' },
        ]
      },
      {
        name: 'Memorandum of Understanding (MOU)',
        fields: [
          { key: 'party1', label: 'Party 1', placeholder: 'Name and address', required: true },
          { key: 'party2', label: 'Party 2', placeholder: 'Name and address', required: true },
          { key: 'purpose', label: 'Purpose / Scope of MOU', placeholder: 'What this MOU covers...', required: true, type: 'textarea' },
          { key: 'obligations1', label: 'Obligations of Party 1', placeholder: 'What Party 1 will do...' , type: 'textarea' },
          { key: 'obligations2', label: 'Obligations of Party 2', placeholder: 'What Party 2 will do...', type: 'textarea' },
          { key: 'term', label: 'Term / Duration', placeholder: 'e.g. 1 year from signing' },
          { key: 'binding', label: 'Binding / Non-Binding', placeholder: 'e.g. Non-binding / Partially binding' },
        ]
      },
      {
        name: 'Share Transfer Agreement',
        fields: [
          { key: 'transferor', label: 'Transferor (Seller)', placeholder: 'Name, address, DIN (if director)', required: true },
          { key: 'transferee', label: 'Transferee (Buyer)', placeholder: 'Name, address', required: true },
          { key: 'company', label: 'Company Name & CIN', placeholder: 'Company name and CIN', required: true },
          { key: 'shares', label: 'Shares Details', placeholder: 'No. of shares, class (equity/preference), face value', required: true },
          { key: 'consideration', label: 'Consideration / Price', placeholder: 'Total price and payment terms', required: true },
          { key: 'representations', label: 'Key Representations', placeholder: 'Free from encumbrance, no litigation...' },
        ]
      },
      {
        name: 'Joint Venture Agreement',
        fields: [
          { key: 'party1', label: 'JV Party 1', placeholder: 'Name and address', required: true },
          { key: 'party2', label: 'JV Party 2', placeholder: 'Name and address', required: true },
          { key: 'purpose', label: 'Purpose of JV', placeholder: 'Business objective of the joint venture', required: true },
          { key: 'shareholding', label: 'Shareholding / Contribution', placeholder: 'e.g. 51% Party 1, 49% Party 2' },
          { key: 'governance', label: 'Governance Structure', placeholder: 'Board composition, decision-making' },
          { key: 'term', label: 'Term', placeholder: 'Duration of JV' },
          { key: 'exit', label: 'Exit Mechanisms', placeholder: 'Tag-along, drag-along, buyout rights...' },
        ]
      },
    ]
  },
  {
    name: 'Supreme Court',
    color: '#f59e0b',
    docs: [
      {
        name: 'SLP (Special Leave Petition) - Art. 136',
        fields: [
          { key: 'petitioner', label: 'Petitioner Name', placeholder: 'Full name', required: true },
          { key: 'respondent', label: 'Respondent(s)', placeholder: 'Full names' },
          { key: 'impugned_judgment', label: 'Impugned Judgment', placeholder: 'Court name, case number, date of judgment', required: true },
          { key: 'questions_of_law', label: 'Questions of Law', placeholder: 'Substantial questions of law involved...', type: 'textarea', required: true },
          { key: 'facts', label: 'Brief Facts', placeholder: 'Background facts...', type: 'textarea' },
          { key: 'grounds', label: 'Grounds', placeholder: 'Grounds for challenging the judgment...', type: 'textarea' },
          { key: 'advocate', label: 'Advocate on Record', placeholder: 'AOR Name' },
        ]
      },
      {
        name: 'Writ Petition (Art. 32) - Fundamental Rights',
        fields: [
          { key: 'petitioner', label: 'Petitioner Name', placeholder: 'Full name', required: true },
          { key: 'respondent', label: 'Respondent (State/Authority)', placeholder: 'Union of India / State / Authority' },
          { key: 'right_violated', label: 'Fundamental Right Violated', placeholder: 'e.g. Article 21 (Right to Life), Article 19(1)(a)', required: true },
          { key: 'impugned_action', label: 'Impugned Action / Order', placeholder: 'What action/order is being challenged', required: true },
          { key: 'facts', label: 'Facts', placeholder: 'Detailed facts...', type: 'textarea', required: true },
          { key: 'grounds', label: 'Grounds', placeholder: 'Legal grounds...', type: 'textarea' },
          { key: 'advocate', label: 'Advocate on Record', placeholder: 'AOR Name' },
        ]
      },
    ]
  },
  {
    name: 'High Court',
    color: '#8b5cf6',
    docs: [
      {
        name: 'Writ Petition (Article 226)',
        fields: [
          { key: 'court', label: 'High Court', placeholder: 'e.g. High Court of Delhi', required: true },
          { key: 'petitioner', label: 'Petitioner Name', placeholder: 'Full name', required: true },
          { key: 'respondent', label: 'Respondents', placeholder: 'State / Authority / Person' },
          { key: 'writ_type', label: 'Type of Writ', placeholder: 'e.g. Certiorari / Mandamus / Habeas Corpus / Prohibition' },
          { key: 'impugned_action', label: 'Impugned Action / Order', placeholder: 'What is being challenged', required: true },
          { key: 'facts', label: 'Facts', placeholder: 'Background facts...', type: 'textarea', required: true },
          { key: 'grounds', label: 'Grounds', placeholder: 'Legal grounds for the writ...', type: 'textarea' },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name' },
        ]
      },
      {
        name: 'Anticipatory Bail (High Court)',
        fields: [
          { key: 'court', label: 'High Court', placeholder: 'e.g. High Court of Delhi', required: true },
          { key: 'applicant', label: 'Applicant Name', placeholder: 'Full name', required: true },
          { key: 'state', label: 'State', placeholder: 'e.g. State of Delhi' },
          { key: 'fir_no', label: 'FIR Details', placeholder: 'FIR No., PS, Sections' },
          { key: 'facts', label: 'Facts & Apprehension', placeholder: 'Why arrest is apprehended...', type: 'textarea', required: true },
          { key: 'grounds', label: 'Grounds', placeholder: 'Grounds for anticipatory bail...', type: 'textarea' },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name' },
        ]
      },
    ]
  },
  {
    name: 'Civil',
    color: '#0ea5e9',
    docs: [
      {
        name: 'Civil Suit (Plaint)',
        fields: [
          { key: 'court', label: 'Court Name', placeholder: 'e.g. Civil Judge (Sr. Div.), New Delhi', required: true },
          { key: 'plaintiff', label: 'Plaintiff Name', placeholder: 'Full name and address', required: true },
          { key: 'defendant', label: 'Defendant Name', placeholder: 'Full name and address', required: true },
          { key: 'cause_of_action', label: 'Cause of Action', placeholder: 'What is the legal basis of the suit', required: true },
          { key: 'valuation', label: 'Valuation of Suit', placeholder: 'e.g. ₹5,00,000 for purposes of jurisdiction and court fees' },
          { key: 'facts', label: 'Facts', placeholder: 'Detailed facts of the dispute...', type: 'textarea', required: true },
          { key: 'relief', label: 'Relief Sought', placeholder: 'Specific reliefs claimed...', type: 'textarea' },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name' },
        ]
      },
      {
        name: 'Injunction Application (Order 39 CPC)',
        fields: [
          { key: 'court', label: 'Court Name', placeholder: 'Court where main suit is pending', required: true },
          { key: 'applicant', label: 'Applicant / Plaintiff', placeholder: 'Name', required: true },
          { key: 'respondent', label: 'Respondent / Defendant', placeholder: 'Name' },
          { key: 'suit_no', label: 'Suit Number', placeholder: 'CS No. ___ of ___' },
          { key: 'injunction_sought', label: 'Injunction Sought', placeholder: 'What specific act should be restrained', required: true },
          { key: 'facts', label: 'Facts', placeholder: 'Facts establishing prima facie case...', type: 'textarea', required: true },
          { key: 'irreparable_harm', label: 'Irreparable Harm', placeholder: 'Why damages are not adequate remedy...', type: 'textarea' },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name' },
        ]
      },
    ]
  },
  {
    name: 'Family Law',
    color: '#ec4899',
    docs: [
      {
        name: 'Divorce Petition (Mutual Consent - S.13B HMA)',
        fields: [
          { key: 'court', label: 'Family Court', placeholder: 'e.g. Principal Judge, Family Court, Delhi', required: true },
          { key: 'husband', label: 'Husband Name', placeholder: 'Full name and address', required: true },
          { key: 'wife', label: 'Wife Name', placeholder: 'Full name and address', required: true },
          { key: 'marriage_date', label: 'Date of Marriage', placeholder: 'e.g. 15th February 2018' },
          { key: 'marriage_place', label: 'Place of Marriage', placeholder: 'City/Town' },
          { key: 'separation_date', label: 'Date of Separation', placeholder: 'When parties started living separately' },
          { key: 'children', label: 'Children (if any)', placeholder: 'Name, age of children' },
          { key: 'settlement', label: 'Settlement Terms', placeholder: 'Alimony, property division, child custody arrangements...', type: 'textarea', required: true },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name' },
        ]
      },
      {
        name: 'Maintenance Application (S.144 BNSS)',
        fields: [
          { key: 'court', label: 'Court', placeholder: 'e.g. JMFC / Family Court', required: true },
          { key: 'applicant', label: 'Applicant Name', placeholder: 'Wife / Child name', required: true },
          { key: 'respondent', label: 'Respondent Name', placeholder: 'Husband / Father name', required: true },
          { key: 'relationship', label: 'Relationship', placeholder: 'e.g. Wife and husband / Minor child' },
          { key: 'respondent_income', label: 'Respondent Income', placeholder: 'Monthly income of respondent' },
          { key: 'amount_sought', label: 'Maintenance Amount Sought', placeholder: 'Monthly amount claimed' },
          { key: 'facts', label: 'Facts', placeholder: 'Marriage details, desertion/neglect, inability to maintain self...', type: 'textarea', required: true },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name' },
        ]
      },
      {
        name: 'Child Custody Petition',
        fields: [
          { key: 'court', label: 'Family Court', placeholder: 'Court name', required: true },
          { key: 'petitioner', label: 'Petitioner (Parent)', placeholder: 'Name seeking custody', required: true },
          { key: 'respondent', label: 'Respondent (Other Parent)', placeholder: 'Name' },
          { key: 'child_name', label: 'Child Name & Age', placeholder: 'Name and date of birth of child', required: true },
          { key: 'current_custody', label: 'Current Custody Situation', placeholder: 'Who has custody currently and since when' },
          { key: 'facts', label: 'Facts', placeholder: 'Background, why custody is sought, best interests of child...', type: 'textarea', required: true },
          { key: 'relief', label: 'Relief Sought', placeholder: 'Full custody / Joint custody / Visitation rights' },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name' },
        ]
      },
    ]
  },
  {
    name: 'Property & Real Estate',
    color: '#10b981',
    docs: [
      {
        name: 'Sale Deed',
        fields: [
          { key: 'seller', label: 'Seller (Vendor) Name', placeholder: 'Full name and address', required: true },
          { key: 'buyer', label: 'Buyer (Vendee) Name', placeholder: 'Full name and address', required: true },
          { key: 'property', label: 'Property Description', placeholder: 'Complete property description with survey no., boundaries, area...', type: 'textarea', required: true },
          { key: 'consideration', label: 'Sale Consideration', placeholder: 'e.g. ₹50,00,000 (Fifty Lakhs)', required: true },
          { key: 'payment_mode', label: 'Payment Mode', placeholder: 'e.g. RTGS/NEFT, Cheque No., Cash' },
          { key: 'possession_date', label: 'Date of Possession', placeholder: 'When possession is handed over' },
          { key: 'encumbrance', label: 'Encumbrance Status', placeholder: 'e.g. Free from all encumbrances' },
          { key: 'registration_district', label: 'Registration District', placeholder: 'Sub-Registrar office' },
        ]
      },
      {
        name: 'Rent Agreement / Lease Deed',
        fields: [
          { key: 'landlord', label: 'Landlord Name', placeholder: 'Full name and address', required: true },
          { key: 'tenant', label: 'Tenant Name', placeholder: 'Full name and address', required: true },
          { key: 'property', label: 'Property Address', placeholder: 'Complete address of the rented premises', required: true },
          { key: 'rent', label: 'Monthly Rent', placeholder: 'e.g. ₹25,000 per month', required: true },
          { key: 'deposit', label: 'Security Deposit', placeholder: 'e.g. ₹75,000 (3 months)' },
          { key: 'start_date', label: 'Commencement Date', placeholder: 'Start date of tenancy' },
          { key: 'duration', label: 'Duration / Lock-in', placeholder: 'e.g. 11 months with 6 month lock-in' },
          { key: 'notice_period', label: 'Notice Period', placeholder: 'e.g. 1 month notice by either party' },
          { key: 'special_terms', label: 'Special Terms', placeholder: 'Maintenance, permitted use, parking, pets...', type: 'textarea' },
        ]
      },
      {
        name: 'Gift Deed',
        fields: [
          { key: 'donor', label: 'Donor Name', placeholder: 'Full name and address', required: true },
          { key: 'donee', label: 'Donee Name', placeholder: 'Full name and address', required: true },
          { key: 'relationship', label: 'Relationship', placeholder: 'e.g. Father to Son, Gift between relatives' },
          { key: 'property', label: 'Property Description', placeholder: 'Complete property details', type: 'textarea', required: true },
          { key: 'consideration', label: 'Consideration', placeholder: 'e.g. Out of love and affection (no monetary consideration)' },
          { key: 'possession', label: 'Possession Date', placeholder: 'When possession is delivered' },
        ]
      },
    ]
  },
  {
    name: 'Labour & Employment',
    color: '#f97316',
    docs: [
      {
        name: 'Termination Letter',
        fields: [
          { key: 'employer', label: 'Employer / Company', placeholder: 'Company name', required: true },
          { key: 'employee', label: 'Employee Name', placeholder: 'Full name', required: true },
          { key: 'designation', label: 'Designation', placeholder: 'Job title' },
          { key: 'joining_date', label: 'Date of Joining', placeholder: 'Employee joining date' },
          { key: 'termination_date', label: 'Effective Termination Date', placeholder: 'Last working day', required: true },
          { key: 'reason', label: 'Reason for Termination', placeholder: 'e.g. Misconduct / Performance / Redundancy / Resignation acceptance', required: true },
          { key: 'notice_pay', label: 'Notice Pay Details', placeholder: 'Notice period served or payment in lieu' },
          { key: 'settlement', label: 'Full & Final Settlement', placeholder: 'PF, gratuity, pending salary, other dues' },
        ]
      },
      {
        name: 'Show Cause Notice (Employment)',
        fields: [
          { key: 'employer', label: 'Employer / Company', placeholder: 'Company name', required: true },
          { key: 'employee', label: 'Employee Name & Designation', placeholder: 'Name and designation', required: true },
          { key: 'allegations', label: 'Allegations / Misconduct', placeholder: 'Specific allegations with dates and incidents...', type: 'textarea', required: true },
          { key: 'incident_date', label: 'Date of Incident', placeholder: 'When the alleged misconduct occurred' },
          { key: 'response_deadline', label: 'Response Deadline', placeholder: 'e.g. Within 48 hours of receipt' },
          { key: 'issuing_authority', label: 'Issuing Authority', placeholder: 'HR Manager / Director name' },
        ]
      },
      {
        name: 'Labour Court Complaint (ID Act)',
        fields: [
          { key: 'court', label: 'Labour Court / Tribunal', placeholder: 'e.g. Labour Court, New Delhi', required: true },
          { key: 'workman', label: 'Workman / Complainant', placeholder: 'Full name and address', required: true },
          { key: 'employer', label: 'Employer / Management', placeholder: 'Company name and address', required: true },
          { key: 'employment_period', label: 'Employment Period', placeholder: 'From date to date' },
          { key: 'nature_of_dispute', label: 'Nature of Dispute', placeholder: 'e.g. Illegal termination / Non-payment of wages / Wrongful retrenchment', required: true },
          { key: 'facts', label: 'Facts', placeholder: 'Detailed facts of the dispute...', type: 'textarea', required: true },
          { key: 'relief', label: 'Relief Sought', placeholder: 'Reinstatement with back wages / Compensation / Other relief' },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name' },
        ]
      },
    ]
  },
  {
    name: 'Notices & Communications',
    color: '#C7A56A',
    docs: [
      {
        name: 'Legal Notice',
        fields: [
          { key: 'sender', label: 'From (Client Name & Address)', placeholder: 'Full name and address', required: true },
          { key: 'recipient', label: 'To (Recipient Name & Address)', placeholder: 'Full name and address', required: true },
          { key: 'subject', label: 'Subject', placeholder: 'Brief subject of notice', required: true },
          { key: 'facts', label: 'Facts & Grievance', placeholder: 'Detailed facts giving rise to this notice...', type: 'textarea', required: true },
          { key: 'demand', label: 'Demand / Relief Sought', placeholder: 'Specific demand or action required', required: true },
          { key: 'deadline', label: 'Compliance Deadline', placeholder: 'e.g. Within 15 days of receipt' },
          { key: 'consequence', label: 'Consequence of Non-Compliance', placeholder: 'Legal action that will follow' },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name (sender\'s advocate)' },
        ]
      },
      {
        name: 'Reply to Legal Notice',
        fields: [
          { key: 'sender', label: 'From (Reply Sender)', placeholder: 'Full name and address', required: true },
          { key: 'original_sender', label: 'To (Original Notice Sender)', placeholder: 'Name and address' },
          { key: 'notice_date', label: 'Date of Original Notice', placeholder: 'Date of notice being replied to' },
          { key: 'reply', label: 'Reply / Response', placeholder: 'Detailed response to the allegations in the notice...', type: 'textarea', required: true },
          { key: 'counter_demand', label: 'Counter Demand (if any)', placeholder: 'Any counter-claim or demand' },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name' },
        ]
      },
    ]
  },
  {
    name: 'Affidavits',
    color: '#64748b',
    docs: [
      {
        name: 'General Affidavit',
        fields: [
          { key: 'deponent', label: 'Deponent Name', placeholder: 'Full name', required: true },
          { key: 'age', label: 'Age', placeholder: 'Age of deponent' },
          { key: 'address', label: 'Address', placeholder: 'Complete address of deponent', required: true },
          { key: 'purpose', label: 'Purpose of Affidavit', placeholder: 'e.g. For submission before [authority/court]', required: true },
          { key: 'statements', label: 'Statements / Facts', placeholder: 'List all facts to be sworn... (each fact will be numbered)', type: 'textarea', required: true },
          { key: 'place', label: 'Place', placeholder: 'City where affidavit is sworn' },
        ]
      },
      {
        name: 'Affidavit of Assets and Liabilities',
        fields: [
          { key: 'deponent', label: 'Deponent Name', placeholder: 'Full name', required: true },
          { key: 'purpose', label: 'Purpose', placeholder: 'e.g. For matrimonial proceedings / Income tax / Court order' },
          { key: 'assets', label: 'Assets', placeholder: 'List all movable and immovable assets with approximate values...', type: 'textarea', required: true },
          { key: 'liabilities', label: 'Liabilities', placeholder: 'List all loans, debts, liabilities...', type: 'textarea' },
          { key: 'income', label: 'Monthly Income', placeholder: 'Income from all sources' },
        ]
      },
    ]
  },
  {
    name: 'Consumer & IP',
    color: '#06b6d4',
    docs: [
      {
        name: 'Consumer Complaint (NCDRC/State/District)',
        fields: [
          { key: 'complainant', label: 'Complainant Name', placeholder: 'Full name and address', required: true },
          { key: 'opposite_party', label: 'Opposite Party (Company/Seller)', placeholder: 'Company name and address', required: true },
          { key: 'product_service', label: 'Product / Service', placeholder: 'What was purchased', required: true },
          { key: 'amount_paid', label: 'Amount Paid', placeholder: 'Total amount paid' },
          { key: 'deficiency', label: 'Deficiency / Defect', placeholder: 'Nature of deficiency in service or defect in product...', type: 'textarea', required: true },
          { key: 'relief', label: 'Relief Sought', placeholder: 'Refund / Replacement / Compensation / Punitive damages', required: true },
          { key: 'forum', label: 'Forum', placeholder: 'District Commission / State Commission / NCDRC (based on amount)' },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name' },
        ]
      },
      {
        name: 'Trademark Cease & Desist',
        fields: [
          { key: 'sender', label: 'Client / Rights Holder', placeholder: 'Company/person name', required: true },
          { key: 'recipient', label: 'Infringer Name & Address', placeholder: 'Who is infringing', required: true },
          { key: 'trademark', label: 'Trademark Details', placeholder: 'Mark name, registration no., class, goods/services', required: true },
          { key: 'infringement', label: 'Nature of Infringement', placeholder: 'How the mark is being infringed...', type: 'textarea', required: true },
          { key: 'demand', label: 'Demands', placeholder: 'Cease use, destroy infringing goods, account for profits...' },
          { key: 'deadline', label: 'Deadline', placeholder: 'e.g. Within 7 days of receipt' },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Adv. Name' },
        ]
      },
    ]
  },
  {
    name: 'General',
    color: '#6b7280',
    docs: [
      {
        name: 'Vakalatnama',
        fields: [
          { key: 'client', label: 'Client Name', placeholder: 'Full name and address', required: true },
          { key: 'advocate', label: 'Advocate Name', placeholder: 'Full name of advocate', required: true },
          { key: 'court', label: 'Court', placeholder: 'Court where appearing', required: true },
          { key: 'case_details', label: 'Case Details', placeholder: 'Case title and number', required: true },
        ]
      },
      {
        name: 'RTI Application',
        fields: [
          { key: 'applicant', label: 'Applicant Name', placeholder: 'Full name', required: true },
          { key: 'address', label: 'Address', placeholder: 'Complete address for correspondence', required: true },
          { key: 'pio', label: 'Public Information Officer & Department', placeholder: 'Department/Ministry name', required: true },
          { key: 'information_sought', label: 'Information Sought', placeholder: 'List specific information/documents required...', type: 'textarea', required: true },
          { key: 'period', label: 'Period / Year', placeholder: 'e.g. Last 3 years / 2022-2025' },
        ]
      },
    ]
  },
]

function renderMarkdown(text: string) {
  return text
    .replace(/^# (.+)$/gm, '<h1 style="font-size:18px;font-weight:800;color:#fff;margin:16px 0 8px;letter-spacing:-0.5px;">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:15px;font-weight:700;color:#fff;margin:14px 0 6px;">$2</h2>'.replace('$2', '$1'))
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);margin:10px 0 4px;">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff;font-weight:700;">$1</strong>')
    .replace(/^- (.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0;"><span style="opacity:0.4;">·</span><span>$1</span></div>')
    .replace(/^(\d+)\. (.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0;"><span style="opacity:0.5;min-width:16px;">$1.</span><span>$2</span></div>')
    .replace(/\n\n/g, '<div style="height:8px"></div>')
}

export default function Drafts() {
  const { token } = useAuth()
  const [selectedCat, setSelectedCat] = useState<Category>(CATEGORIES[0])
  const [selectedDoc, setSelectedDoc] = useState<DocType>(CATEGORIES[0].docs[0])
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [document, setDocument] = useState('')
  const [copied, setCopied] = useState(false)
  const [width, setWidth] = useState(1200)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setWidth(window.innerWidth)
    const h = () => setWidth(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const isMobile = width < 768
  const bg = '#080809'; const surface = '#0d0d0f'
  const border = 'rgba(255,255,255,0.08)'; const borderHi = 'rgba(255,255,255,0.2)'
  const tp = '#ffffff'; const tm = 'rgba(255,255,255,0.6)'; const td = 'rgba(255,255,255,0.3)'
  const sidebarBg = '#060608'

  const selectDoc = (cat: Category, doc: DocType) => {
    setSelectedCat(cat)
    setSelectedDoc(doc)
    setFieldValues({})
    setDocument('')
    setSidebarOpen(false)
  }

  const requiredFilled = selectedDoc.fields.filter(f => f.required).every(f => fieldValues[f.key]?.trim())

  const generate = async () => {
    if (!requiredFilled) return
    setLoading(true); setDocument('')
    try {
      const res = await fetch(`${API}/api/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_type: selectedDoc.name,
          court: fieldValues['court'] || '',
          petitioner: fieldValues['petitioner'] || fieldValues['applicant'] || fieldValues['plaintiff'] || fieldValues['accused'] || fieldValues['sender'] || fieldValues['party1'] || fieldValues['employer'] || fieldValues['complainant'] || fieldValues['donor'] || fieldValues['deponent'] || '',
          respondent: fieldValues['respondent'] || fieldValues['state'] || fieldValues['defendant'] || fieldValues['recipient'] || fieldValues['party2'] || fieldValues['employee'] || fieldValues['opposite_party'] || fieldValues['donee'] || '',
          facts: fieldValues['facts'] || fieldValues['resolution_details'] || fieldValues['purpose'] || fieldValues['information_sought'] || fieldValues['statements'] || fieldValues['deficiency'] || '',
          grounds: fieldValues['grounds'] || fieldValues['relief'] || fieldValues['demand'] || '',
          fields: fieldValues,
          save: !!token,
        }),
      })
      const data = await res.json()
      setDocument(data.document || 'Error generating document')
    } catch { setDocument('Could not connect to server. Please try again.') }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${border}`,
    borderRadius: 8, padding: '10px 14px', fontSize: 13, color: tp,
    fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' as const,
  }

  return (
    <main style={{ height: '100vh', background: bg, color: tp, fontFamily: 'system-ui,sans-serif', display: 'flex', overflow: 'hidden' }}>
      <style>{`
        textarea{resize:vertical} input::placeholder,textarea::placeholder{color:${td}}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .cat-btn:hover{background:rgba(255,255,255,0.06)!important}
        .doc-btn:hover{background:rgba(255,255,255,0.04)!important}
      `}</style>

      {/* SIDEBAR */}
      {(!isMobile || sidebarOpen) && (
        <div style={{ width: isMobile ? '100%' : 240, flexShrink: 0, background: sidebarBg, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', position: isMobile ? 'fixed' : 'relative', inset: isMobile ? 0 : 'auto', zIndex: isMobile ? 50 : 1, overflow: 'hidden' }}>
          {/* Logo */}
          <div style={{ padding: '14px 12px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <button onClick={() => window.location.href = '/about'} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
              <LogoMark size={18} color={tp}/>
              <span style={{ fontSize: 13, fontWeight: 700, color: tp }}>LexIndia</span>
            </button>
            {isMobile && <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: td, cursor: 'pointer', fontSize: 18 }}>✕</button>}
          </div>

          {/* Category + Doc list */}
          <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
            <div style={{ fontSize: 10, color: td, letterSpacing: '1px', textTransform: 'uppercase', padding: '6px 4px 8px', fontWeight: 600 }}>Document Categories</div>
            {CATEGORIES.map(cat => (
              <div key={cat.name} style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', cursor: 'pointer' }}
                  onClick={() => setSelectedCat(selectedCat.name === cat.name ? selectedCat : cat)}>
                  <div style={{ width: 3, height: 12, borderRadius: 2, background: cat.color, flexShrink: 0 }}/>
                  <span style={{ fontSize: 11, fontWeight: 700, color: selectedCat.name === cat.name ? tp : tm, letterSpacing: '0.3px' }}>{cat.name}</span>
                  <span style={{ fontSize: 10, color: td, marginLeft: 'auto' }}>{cat.docs.length}</span>
                </div>
                {selectedCat.name === cat.name && (
                  <div style={{ paddingLeft: 11 }}>
                    {cat.docs.map(doc => (
                      <button key={doc.name} className="doc-btn" onClick={() => selectDoc(cat, doc)}
                        style={{ width: '100%', padding: '6px 8px', background: selectedDoc.name === doc.name ? `${cat.color}18` : 'transparent', border: selectedDoc.name === doc.name ? `1px solid ${cat.color}33` : '1px solid transparent', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', fontSize: 11, color: selectedDoc.name === doc.name ? cat.color : tm, marginBottom: 2, lineHeight: 1.4, transition: 'all 0.15s' }}>
                        {doc.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Nav links */}
          <div style={{ padding: '8px', borderTop: `1px solid ${border}`, flexShrink: 0 }}>
            {[
              { label: 'LexSearch', path: '/research' },
              { label: 'LexTrack', path: '/track' },
              { label: 'LexVault', path: '/vault' },
            ].map(l => (
              <button key={l.label} onClick={() => window.location.href = l.path}
                style={{ width: '100%', padding: '6px 8px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, color: td, textAlign: 'left', borderRadius: 6 }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* TOP NAV */}
        <nav style={{ borderBottom: `1px solid ${border}`, padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,8,9,0.92)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: td, cursor: 'pointer', padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            )}
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: selectedCat.color }}/>
            <span style={{ fontSize: 14, fontWeight: 700, color: selectedCat.color }}>LexDraft</span>
            <span style={{ fontSize: 11, color: td }}>— {selectedDoc.name}</span>
          </div>
          {document && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { navigator.clipboard.writeText(document); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                style={{ padding: '5px 14px', background: copied ? 'rgba(63,185,80,0.1)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? 'rgba(63,185,80,0.3)' : border}`, borderRadius: 8, fontSize: 12, color: copied ? '#3fb950' : tm, cursor: 'pointer', fontFamily: 'inherit' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <button onClick={() => {
                const blob = new Blob([document], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = window.document.createElement('a')
                a.href = url; a.download = `${selectedDoc.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`; a.click()
                URL.revokeObjectURL(url)
              }} style={{ padding: '5px 14px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${border}`, borderRadius: 8, fontSize: 12, color: tm, cursor: 'pointer', fontFamily: 'inherit' }}>
                Download
              </button>
              <button onClick={() => { setDocument(''); setFieldValues({}) }}
                style={{ padding: '5px 14px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, fontSize: 12, color: td, cursor: 'pointer', fontFamily: 'inherit' }}>
                New Draft
              </button>
            </div>
          )}
        </nav>

        {/* CONTENT */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', gap: 0 }}>

          {/* FORM */}
          {!document && (
            <div style={{ flex: 1, padding: isMobile ? '20px 16px' : '28px 32px', maxWidth: 680, animation: 'fadeIn 0.3s ease' }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: td, marginBottom: 6, textTransform: 'uppercase' }}>LexDraft</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: tp, marginBottom: 4, letterSpacing: -0.5 }}>{selectedDoc.name}</h2>
              <p style={{ fontSize: 12, color: td, marginBottom: 24 }}>Fill in the details below to generate a professional legal document</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {selectedDoc.fields.map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: 11, color: td, letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>
                      {field.label} {field.required && <span style={{ color: selectedCat.color }}>*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={fieldValues[field.key] || ''}
                        onChange={e => setFieldValues(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        rows={4}
                        style={{ ...inputStyle, lineHeight: 1.6 }}
                        onFocus={e => e.target.style.borderColor = selectedCat.color + '66'}
                        onBlur={e => e.target.style.borderColor = border}
                      />
                    ) : (
                      <input
                        type="text"
                        value={fieldValues[field.key] || ''}
                        onChange={e => setFieldValues(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = selectedCat.color + '66'}
                        onBlur={e => e.target.style.borderColor = border}
                      />
                    )}
                  </div>
                ))}
              </div>

              <button onClick={generate} disabled={loading || !requiredFilled}
                style={{ width: '100%', marginTop: 24, padding: '13px', background: requiredFilled && !loading ? selectedCat.color : 'rgba(255,255,255,0.08)', color: requiredFilled && !loading ? '#000' : td, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: requiredFilled && !loading ? 'pointer' : 'default', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                {loading ? (
                  <><div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/> Generating...</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Generate Document</>
                )}
              </button>
              {!requiredFilled && <p style={{ fontSize: 11, color: td, marginTop: 8, textAlign: 'center' }}>* Required fields must be filled</p>}

              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.15)', borderRadius: 8 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,165,0,0.8)', margin: 0, lineHeight: 1.5 }}>
                  ⚠ Review carefully before filing. Verify all citations and party details. AI may make errors in specific citations or local court rules.
                </p>
              </div>
            </div>
          )}

          {/* GENERATED DOCUMENT */}
          {document && (
            <div style={{ flex: 1, padding: isMobile ? '20px 16px' : '28px 32px', animation: 'fadeIn 0.4s ease', overflow: 'auto' }}>
              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: '28px', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: td, marginBottom: 16, textTransform: 'uppercase' }}>Generated Document — {selectedDoc.name}</div>
                <div style={{ fontSize: 13, color: tm, lineHeight: 1.85, fontFamily: 'Georgia, serif' }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(document) }}/>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}