"""
Management command: python manage.py seed_schemes
Seeds 51 real/representative Indian government schemes with JSON Logic eligibility rules.
Safe to re-run — uses get_or_create/update so no duplicates.
"""
from django.core.management.base import BaseCommand
from schemes.models import Scheme, SchemeRule

SCHEMES_DATA = [
    # ─── Central Schemes (Agriculture) ──────────────────────────────────────────
    {
        "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "description": "Direct income support of ₹6,000/year to small and marginal farmer families across India, transferred in 3 equal installments of ₹2,000 directly to their bank accounts.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "₹6,000 per year direct bank transfer in 3 installments of ₹2,000 each.",
        "documents_required": "Aadhaar Card, Bank Passbook, Land Records (Khasra/Khatauni), Self-declaration form",
        "official_website": "https://pmkisan.gov.in",
        "search_tags": "farmer agriculture kisan income support land owner pm-kisan",
        "rule": {
            "and": [
                {"==": [{"var": "occupation"}, "Farmer"]},
                {"<": [{"var": "annual_income"}, 300000]},
                {">": [{"var": "land_ownership_acres"}, 0]},
                {"<": [{"var": "land_ownership_acres"}, 5]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "description": "Yield-based crop insurance scheme providing financial support to farmers suffering crop loss due to natural calamities, pests, or diseases.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "Financial cover for crop loss. Low premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial/horticultural crops.",
        "documents_required": "Aadhaar Card, Land Possession Certificate, Land tenancy agreement, Sowing certificate, Bank Passbook",
        "official_website": "https://pmfby.gov.in",
        "search_tags": "crop insurance agriculture farm loss damage yield pmfby",
        "rule": {
            "and": [
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">": [{"var": "land_ownership_acres"}, 0]}
            ]
        }
    },
    {
        "name": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) - Micro Irrigation",
        "description": "Water conservation scheme providing subsidies on micro-irrigation equipment (drip and sprinkler systems) to improve water-use efficiency on farms.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "Up to 55% subsidy for small/marginal farmers and 45% for other farmers for installing drip and sprinkler systems.",
        "documents_required": "Aadhaar Card, Land Records, Category Certificate (for SC/ST), Bank details",
        "official_website": "https://pmksy.gov.in",
        "search_tags": "irrigation water drip sprinkler farm agriculture pump subsidy pmksy",
        "rule": {
            "and": [
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">": [{"var": "land_ownership_acres"}, 0]},
                {"<": [{"var": "land_ownership_acres"}, 10]}
            ]
        }
    },
    {
        "name": "Kisan Credit Card (KCC)",
        "description": "Enables farmers to receive easy access to short-term credit for crop cultivation, post-harvest expenses, and working capital for allied activities.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "Credit limit up to ₹3 lakh at low interest rates (around 4% after subvention). Includes accidental insurance cover.",
        "documents_required": "Aadhaar Card, Land Records, Identity Proof, Address Proof, Bank Statement",
        "official_website": "https://www.rbi.org.in",
        "search_tags": "credit card loan farm loan agriculture credit short term kcc",
        "rule": {
            "and": [
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">": [{"var": "land_ownership_acres"}, 0]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Paramparagat Krishi Vikas Yojana (PKVY)",
        "description": "Supports organic farming clusters through financial assistance, certification guidance, and marketing support to promote soil health.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "₹50,000 per hectare financial assistance over three years for organic inputs, harvesting, and value addition.",
        "documents_required": "Aadhaar Card, Land records, Farmer Group Cluster Certificate, Bank details",
        "official_website": "https://dap.dac.gov.in",
        "search_tags": "organic farm compost bio fertilizer cluster agriculture pkvy",
        "rule": {
            "and": [
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">": [{"var": "land_ownership_acres"}, 0]}
            ]
        }
    },

    # ─── Central Schemes (MSME) ─────────────────────────────────────────────────
    {
        "name": "PM Mudra Loan — Shishu Category",
        "description": "Collateral-free micro-loans up to ₹50,000 for small businesses and entrepreneurs under MUDRA (Micro Units Development & Refinance Agency).",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "Loan up to ₹50,000 at subsidised interest rate. No collateral required. Business training support.",
        "documents_required": "Aadhaar Card, PAN Card, Bank Statement (6 months), Business plan/proof, Address proof",
        "official_website": "https://www.mudra.org.in",
        "search_tags": "loan business mudra msme self-employed entrepreneur micro small shishu",
        "rule": {
            "and": [
                {"in": [{"var": "occupation"}, ["Business", "Self-employed"]]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 65]},
                {"<": [{"var": "annual_income"}, 500000]}
            ]
        }
    },
    {
        "name": "PM Mudra Loan — Kishore Category",
        "description": "Collateral-free micro-loans from ₹50,001 to ₹5,00,000 for mid-stage business development, machinery purchases, and scaling up operations.",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "Loans between ₹50,000 and ₹5,00,000. Interest rates based on bank norms. No collateral needed.",
        "documents_required": "Aadhaar Card, Business PAN, 3 years balance sheet, Income tax return, Bank Statement",
        "official_website": "https://www.mudra.org.in",
        "search_tags": "loan business mudra msme finance grow kishore medium",
        "rule": {
            "and": [
                {"in": [{"var": "occupation"}, ["Business", "Self-employed"]]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 65]},
                {"<": [{"var": "annual_income"}, 1000000]}
            ]
        }
    },
    {
        "name": "PM Mudra Loan — Tarun Category",
        "description": "Collateral-free micro-loans from ₹5,00,001 to ₹10,00,000 for established micro-enterprises wanting to expand into larger markets.",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "Expansion loan up to ₹10 lakh. Low processing fee. Flexible repayment options.",
        "documents_required": "Aadhaar Card, PAN Card, Business registration certificate, audited balance sheet, sales reports",
        "official_website": "https://www.mudra.org.in",
        "search_tags": "loan business mudra msme expansion scale investment tarun",
        "rule": {
            "and": [
                {"in": [{"var": "occupation"}, ["Business", "Self-employed"]]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 65]},
                {"<": [{"var": "annual_income"}, 2000000]}
            ]
        }
    },
    {
        "name": "Prime Minister's Employment Generation Programme (PMEGP)",
        "description": "Credit-linked subsidy scheme for setting up new micro-enterprises in manufacturing or service sectors, generating employment.",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "Subsidy of 15% to 35% on project cost (up to ₹50 lakh for manufacturing and ₹20 lakh for services). Loan covered by banks.",
        "documents_required": "Aadhaar Card, Caste Certificate, Project Report, Educational Certificate, UID/EDI Certificate",
        "official_website": "https://www.kviconline.gov.in/pmegpeportal",
        "search_tags": "startup business loan project subsidy manufacture service pmegp",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"in": [{"var": "education"}, ["Graduate", "Post-Graduate", "PhD", "Higher Secondary", "Secondary"]]},
                {"<": [{"var": "annual_income"}, 1500000]}
            ]
        }
    },
    {
        "name": "Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)",
        "description": "Provides collateral-free credit facility to new and existing micro and small enterprises to enable access to formal credit.",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "Credit guarantee cover up to 75% or 85% of the loan amount for credit facilities up to ₹2 crore.",
        "documents_required": "Aadhaar Card, Business PAN, Registration Certificate (Udyam), Detailed Project Report",
        "official_website": "https://www.cgtmse.in",
        "search_tags": "credit guarantee loan collateral free business small scale cgtmse",
        "rule": {
            "and": [
                {"in": [{"var": "occupation"}, ["Business", "Self-employed"]]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "SIDBI Make in India Soft Loan Fund (SMILE)",
        "description": "Soft loans in the nature of quasi-equity or term loans on relatively soft terms to MSMEs to support Make in India initiatives.",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "Quasi-equity soft loans at lower interest rates to maintain a debt-equity ratio for project setup.",
        "documents_required": "Aadhaar, Udyam Registration, Financial reports, Project valuation reports",
        "official_website": "https://www.sidbi.in",
        "search_tags": "make in india sidbi loan soft loan equity finance smile",
        "rule": {
            "and": [
                {"in": [{"var": "occupation"}, ["Business", "Self-employed"]]},
                {">=": [{"var": "age"}, 21]},
                {"<": [{"var": "annual_income"}, 5000000]}
            ]
        }
    },

    # ─── Central Schemes (Education) ────────────────────────────────────────────
    {
        "name": "National Scholarship Portal — Post-Matric Scholarship (SC Students)",
        "description": "Central government scholarship for SC students pursuing post-matric education. Covers tuition fees and maintenance allowance.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "Full tuition fee reimbursement + maintenance allowance (₹2,250–₹1,200/month depending on course level).",
        "documents_required": "Aadhaar Card, Marksheets, Caste Certificate, Income Certificate, Bank Passbook, College/Institution ID",
        "official_website": "https://scholarships.gov.in",
        "search_tags": "scholarship sc student education post-matric fee tuition",
        "rule": {
            "and": [
                {"==": [{"var": "is_student"}, True]},
                {"==": [{"var": "category"}, "SC"]},
                {"<": [{"var": "annual_income"}, 250000]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "OBC Post-Matric Scholarship",
        "description": "Centrally sponsored scholarship for OBC students pursuing post-matric education to enable them to complete higher studies.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "Maintenance allowance ₹1,200–₹2,250/month. Tuition fee reimbursement. Study tour charges.",
        "documents_required": "Aadhaar Card, OBC Certificate, Marksheets, Income Certificate, Bank Passbook, College ID",
        "official_website": "https://scholarships.gov.in",
        "search_tags": "obc scholarship student post-matric other backward class education fee",
        "rule": {
            "and": [
                {"==": [{"var": "is_student"}, True]},
                {"==": [{"var": "category"}, "OBC"]},
                {"<": [{"var": "annual_income"}, 300000]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Disability Scholarship (National Fellowship and Scholarship for PwD)",
        "description": "Scholarship for students with benchmark disabilities pursuing higher education (graduation, post-graduation, M.Phil/PhD).",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "₹7,000–₹8,000/month maintenance allowance. Full course fees reimbursed. Contingency allowance.",
        "documents_required": "Disability Certificate (min 40%), Aadhaar, Marksheets, Income Certificate, Bank Passbook, Institution ID",
        "official_website": "https://scholarships.gov.in",
        "search_tags": "disability scholarship pwd student higher education fellowship physically challenged",
        "rule": {
            "and": [
                {"==": [{"var": "disability_status"}, True]},
                {"==": [{"var": "is_student"}, True]},
                {"<": [{"var": "annual_income"}, 250000]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Central Sector Scheme of Scholarship for College and University Students (CSSS)",
        "description": "Financial assistance to meritorious students from low-income families to meet their day-to-day expenses while pursuing higher studies.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "₹12,000 per year for graduation (first 3 years) and ₹20,000 per year for post-graduation.",
        "documents_required": "Aadhaar Card, 12th Marksheet, Income Certificate, Bank Passbook, Fee Receipt",
        "official_website": "https://scholarships.gov.in",
        "search_tags": "merit scholarship scholarship degree college university central sector csss",
        "rule": {
            "and": [
                {"==": [{"var": "is_student"}, True]},
                {"<": [{"var": "annual_income"}, 450000]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "PM Yasasvi Scholarship Scheme",
        "description": "Scholarship for OBC, EBC, and DNT students studying in classes 9 to 12 or top class colleges, helping them pay school and tuition fees.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "Scholarship of ₹75,000 per year for school students and up to ₹1,25,000 per year for college students.",
        "documents_required": "Aadhaar Card, Class 8/10 marksheet, Income Certificate, Category Certificate",
        "official_website": "https://yet.nta.ac.in",
        "search_tags": "yasasvi scholarship obc ebc student school college yesasvi pm-yasasvi",
        "rule": {
            "and": [
                {"==": [{"var": "is_student"}, True]},
                {"in": [{"var": "category"}, ["OBC", "General"]]},
                {"<": [{"var": "annual_income"}, 250000]}
            ]
        }
    },
    {
        "name": "Babu Jagjivan Ram Chhatrawas Yojna",
        "description": "Funding for construction of hostels for SC girls and boys to encourage SC students to pursue education in colleges and universities.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "Provides state-of-the-art hostel accommodation with zero rent for eligible SC students.",
        "documents_required": "Aadhaar Card, Student ID, Caste Certificate, Admission Proof",
        "official_website": "https://socialjustice.gov.in",
        "search_tags": "hostel accommodation sc student stay hostel girls boys",
        "rule": {
            "and": [
                {"==": [{"var": "is_student"}, True]},
                {"==": [{"var": "category"}, "SC"]}
            ]
        }
    },

    # ─── Central Schemes (Pension) ──────────────────────────────────────────────
    {
        "name": "Atal Pension Yojana (APY)",
        "description": "Government-backed pension scheme for unorganised sector workers. Guarantees a fixed monthly pension of ₹1,000–₹5,000 after age 60.",
        "category": "Pension",
        "state_applicable": "All",
        "benefits": "Guaranteed monthly pension of ₹1,000 to ₹5,000 after 60 years depending on contribution. Government co-contribution for early subscribers.",
        "documents_required": "Aadhaar Card, Bank Account (savings), Mobile Number",
        "official_website": "https://npscra.nsdl.co.in",
        "search_tags": "pension retirement unorganised worker atal apy savings monthly",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 40]},
                {"in": [{"var": "employment_status"}, ["Self-employed", "Unemployed", "Other"]]},
                {"<": [{"var": "annual_income"}, 500000]}
            ]
        }
    },
    {
        "name": "Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)",
        "description": "Voluntary pension scheme for unorganised workers. Assures a monthly pension of ₹3,000 after age 60.",
        "category": "Pension",
        "state_applicable": "All",
        "benefits": "Assured monthly pension of ₹3,000 after age 60. Equal matching contribution by the Central Government.",
        "documents_required": "Aadhaar Card, Savings Bank Account details, Consent Form for auto-debit",
        "official_website": "https://maandhan.in",
        "search_tags": "pension retirement worker unorganised labour pm-sym monthly",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 40]},
                {"in": [{"var": "employment_status"}, ["Self-employed", "Unemployed", "Other"]]},
                {"<": [{"var": "annual_income"}, 180000]}
            ]
        }
    },
    {
        "name": "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
        "description": "Monthly pension support for elderly citizens from BPL (Below Poverty Line) families across India.",
        "category": "Pension",
        "state_applicable": "All",
        "benefits": "Monthly pension of ₹200 (age 60-79) and ₹500 (age 80+). State governments add extra top-ups.",
        "documents_required": "Aadhaar Card, BPL Card, Age Proof, Bank Passbook",
        "official_website": "https://nsap.nic.in",
        "search_tags": "old age pension senior citizen elderly destitute ignoaps",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 60]},
                {"<": [{"var": "annual_income"}, 100000]}
            ]
        }
    },
    {
        "name": "Indira Gandhi National Disability Pension Scheme (IGNDPS)",
        "description": "Monthly pension support for disabled persons (min 80% disability) from BPL families.",
        "category": "Pension",
        "state_applicable": "All",
        "benefits": "Monthly pension of ₹300 per month for individuals aged 18 to 79 years.",
        "documents_required": "Aadhaar Card, Disability Certificate, BPL Card, Bank Account Details",
        "official_website": "https://nsap.nic.in",
        "search_tags": "disabled handicap pension monthly disability igndps pwd",
        "rule": {
            "and": [
                {"==": [{"var": "disability_status"}, True]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 79]},
                {"<": [{"var": "annual_income"}, 100000]}
            ]
        }
    },
    {
        "name": "Pradhan Mantri Kisan Maan-Dhan Yojana (PM-KMY)",
        "description": "Old age pension scheme for small and marginal farmers, providing a guaranteed pension of ₹3,000/month after age 60.",
        "category": "Pension",
        "state_applicable": "All",
        "benefits": "₹3,000 monthly pension upon reaching 60 years. Life insurance for spouse in case of farmer's death.",
        "documents_required": "Aadhaar Card, Land Records, Bank Account Details, Mobile Number",
        "official_website": "https://maandhan.in",
        "search_tags": "pension farmer old age retirement land owner pm-kmy maandhan",
        "rule": {
            "and": [
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 40]},
                {">": [{"var": "land_ownership_acres"}, 0]},
                {"<=": [{"var": "land_ownership_acres"}, 5]}
            ]
        }
    },
    {
        "name": "Widow Pension Scheme (Indira Gandhi National Widow Pension Scheme)",
        "description": "Monthly pension for widows aged 40–79 years from BPL families under the National Social Assistance Programme (NSAP).",
        "category": "Pension",
        "state_applicable": "All",
        "benefits": "₹300/month from Central Government. States top-up additionally (e.g. Tamil Nadu pays ₹1,000/month total).",
        "documents_required": "Aadhaar Card, BPL Card, Husband's Death Certificate, Age Proof, Bank Passbook",
        "official_website": "https://nsap.nic.in",
        "search_tags": "widow pension woman widowed bpl nsap monthly assistance",
        "rule": {
            "and": [
                {"==": [{"var": "gender"}, "Female"]},
                {"==": [{"var": "marital_status"}, "Widowed"]},
                {">=": [{"var": "age"}, 40]},
                {"<=": [{"var": "age"}, 79]},
                {"<": [{"var": "annual_income"}, 100000]}
            ]
        }
    },

    # ─── Central Schemes (Insurance & Health) ───────────────────────────────────
    {
        "name": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
        "description": "Life insurance scheme offering ₹2 lakh coverage on death (any cause) for just ₹436/year premium.",
        "category": "Insurance",
        "state_applicable": "All",
        "benefits": "₹2,00,000 life cover. Premium auto-debited. No medical examination needed.",
        "documents_required": "Aadhaar Card, Bank Account, Mobile Number (linked to bank)",
        "official_website": "https://jansuraksha.gov.in",
        "search_tags": "insurance life cover jeevan jyoti bima pmjjby death benefit",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 50]},
                {"<": [{"var": "annual_income"}, 500000]}
            ]
        }
    },
    {
        "name": "PM Suraksha Bima Yojana (PMSBY)",
        "description": "Accident insurance scheme offering ₹2 lakh cover for accidental death or full disability at just ₹20/year premium.",
        "category": "Insurance",
        "state_applicable": "All",
        "benefits": "₹2 lakh cover for accidental death/permanent total disability, ₹1 lakh for permanent partial disability.",
        "documents_required": "Aadhaar Card, Savings Bank Account, Mobile Number",
        "official_website": "https://jansuraksha.gov.in",
        "search_tags": "insurance accident cover security pmsby accidental death premium",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 70]}
            ]
        }
    },
    {
        "name": "Ayushman Bharat — Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
        "description": "Health cover of ₹5 lakh per family per year for secondary and tertiary care hospitalization to poor and vulnerable families.",
        "category": "Health",
        "state_applicable": "All",
        "benefits": "₹5 lakh annual cashless family floater health cover. Covers pre-existing diseases and pre/post-hospitalization.",
        "documents_required": "Aadhaar Card, Ration Card / PM-JAY Letter, Family identity proof",
        "official_website": "https://pmjay.gov.in",
        "search_tags": "health insurance hospital treatment cash-free ayushman bharat pmjay",
        "rule": {
            "and": [
                {"<": [{"var": "annual_income"}, 120000]},
                {"in": [{"var": "category"}, ["SC", "ST", "OBC"]]}
            ]
        }
    },

    # ─── Central Schemes (Finance & Housing) ────────────────────────────────────
    {
        "name": "Sukanya Samriddhi Yojana (SSY)",
        "description": "Small savings scheme for parents of girl children below 10 years. Offers high interest rate and tax benefits under Section 80C.",
        "category": "Finance",
        "state_applicable": "All",
        "benefits": "8.2% p.a. interest (highest among small savings). Tax-free returns. Minimum deposit ₹250/year.",
        "documents_required": "Girl child's Birth Certificate, Parent/Guardian Aadhaar, PAN Card, Address Proof",
        "official_website": "https://www.indiapost.gov.in",
        "search_tags": "sukanya girl child savings education savings account daughter",
        "rule": {
            "and": [
                {"==": [{"var": "gender"}, "Female"]},
                {"<": [{"var": "age"}, 10]},
                {">=": [{"var": "age"}, 0]}
            ]
        }
    },
    {
        "name": "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
        "description": "Financial inclusion mission ensuring access to savings accounts, remittance, credit, insurance, and pensions.",
        "category": "Finance",
        "state_applicable": "All",
        "benefits": "Zero balance savings account, free RuPay debit card, ₹10,000 overdraft facility, ₹2 lakh accidental insurance cover.",
        "documents_required": "Aadhaar Card, PAN Card (optional), Passport size photo",
        "official_website": "https://pmjdy.gov.in",
        "search_tags": "bank account zero balance overdraft card savings jan dhan pmjdy",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 10]}
            ]
        }
    },
    {
        "name": "Public Provident Fund (PPF)",
        "description": "Long-term small savings scheme offering attractive interest rates and tax-exempt returns.",
        "category": "Finance",
        "state_applicable": "All",
        "benefits": "Guaranteed tax-free interest (current rate ~7.1%). Complete capital safety under Sovereign Guarantee.",
        "documents_required": "Aadhaar Card, PAN Card, KYC Documents, Passport Photo",
        "official_website": "https://www.indiapost.gov.in",
        "search_tags": "ppf savings investment tax free provident fund retirement safety",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Sovereign Gold Bond (SGB) Scheme",
        "description": "Government securities denominated in grams of gold, offering an alternative to holding physical gold with added yield.",
        "category": "Finance",
        "state_applicable": "All",
        "benefits": "2.5% annual interest. Capital gains tax exemption at maturity. No storage/making charges.",
        "documents_required": "Aadhaar Card, PAN Card, Bank Account Details",
        "official_website": "https://www.rbi.org.in",
        "search_tags": "gold bond sovereign investment paper gold interest sgb",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Pradhan Mantri Awas Yojana — Gramin (PMAY-G)",
        "description": "Housing scheme providing financial assistance to BPL (Below Poverty Line) rural households for construction of a pucca house.",
        "category": "Housing",
        "state_applicable": "All",
        "benefits": "₹1.20 lakh assistance for plain areas, ₹1.30 lakh for hilly/difficult areas. Plus MGNREGS wages for construction.",
        "documents_required": "Aadhaar Card, BPL Card / Ration Card, Bank Passbook, Land ownership documents, Income Certificate",
        "official_website": "https://pmayg.nic.in",
        "search_tags": "housing home pucca rural pmay gramin BPL below poverty line",
        "rule": {
            "and": [
                {"==": [{"var": "is_rural"}, True]},
                {"<": [{"var": "annual_income"}, 100000]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Pradhan Mantri Awas Yojana — Urban (PMAY-U)",
        "description": "Provides interest subsidy on home loans for purchase or construction of houses in urban areas.",
        "category": "Housing",
        "state_applicable": "All",
        "benefits": "Interest subsidy up to 6.5% on home loans for EWS, LIG, and MIG categories. Direct subsidy for house building.",
        "documents_required": "Aadhaar Card, PAN Card, Income Certificate, Affidavit declaring no pucca house in India",
        "official_website": "https://pmay-urban.gov.in",
        "search_tags": "housing urban home loan subsidy city flat pmay pmay-u",
        "rule": {
            "and": [
                {"==": [{"var": "is_rural"}, False]},
                {"<": [{"var": "annual_income"}, 600000]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },

    # ─── Central Schemes (Women & Employment) ──────────────────────────────────
    {
        "name": "Mahila Samman Saving Certificate",
        "description": "Small savings scheme exclusively for women offering a fixed interest rate of 7.5% for a 2-year tenure.",
        "category": "Finance",
        "state_applicable": "All",
        "benefits": "7.5% annual interest. Flexible partial withdrawal up to 40% after one year. Minimum deposit ₹1,000.",
        "documents_required": "Aadhaar Card, PAN Card, Account Opening Form, KYC",
        "official_website": "https://www.indiapost.gov.in",
        "search_tags": "women savings mahila samman finance fixed deposit post office",
        "rule": {
            "and": [
                {"==": [{"var": "gender"}, "Female"]}
            ]
        }
    },
    {
        "name": "Pradhan Mantri Ujjwala Yojana (PMUY)",
        "description": "Provides free LPG connections to adult women belonging to Below Poverty Line (BPL) households.",
        "category": "Women",
        "state_applicable": "All",
        "benefits": "Free LPG connection (stove + cylinder) + subsidy of ₹300 per refill up to 12 refills a year.",
        "documents_required": "Aadhaar Card, BPL Ration Card, Address Proof, Bank Passbook",
        "official_website": "https://www.pmuy.gov.in",
        "search_tags": "women gas cylinder cooking lpg free connection bpl ujjwala pmuy",
        "rule": {
            "and": [
                {"==": [{"var": "gender"}, "Female"]},
                {"<": [{"var": "annual_income"}, 100000]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "MGNREGA (Rural Employment Guarantee)",
        "description": "Guarantees 100 days of manual wage employment per year to rural households whose adult members volunteer.",
        "category": "Employment",
        "state_applicable": "All",
        "benefits": "Guaranteed 100 days of manual work at state-specific minimum wages. Unemployment allowance if work not provided.",
        "documents_required": "Aadhaar Card, Job Card, Bank Passbook, Passport Photo",
        "official_website": "https://nrega.nic.in",
        "search_tags": "employment job guarantee rural manual wage mgnrega labour",
        "rule": {
            "and": [
                {"==": [{"var": "is_rural"}, True]},
                {"in": [{"var": "employment_status"}, ["Unemployed", "Self-employed", "Other"]]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },

    # ─── State Schemes (Tamil Nadu) ─────────────────────────────────────────────
    {
        "name": "Pudhumai Penn Scheme (Tamil Nadu)",
        "description": "Assistance scheme for girl students from government schools in Tamil Nadu to pursue higher education.",
        "category": "Education",
        "state_applicable": "Tamil Nadu",
        "benefits": "₹1,000 per month directly deposited into the student's bank account during their undergraduate/diploma course.",
        "documents_required": "Aadhaar Card, Government School Study Certificate (6th to 12th), College Admission card, Bank details",
        "official_website": "https://penkalvi.tn.gov.in",
        "search_tags": "girl student college scholarship higher education tamil nadu pudhumai penn",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {"==": [{"var": "gender"}, "Female"]},
                {"==": [{"var": "is_student"}, True]},
                {">=": [{"var": "age"}, 17]}
            ]
        }
    },
    {
        "name": "Kalaignar Magalir Urimai Thogai (Tamil Nadu)",
        "description": "Monthly basic rights grant to women heads of eligible households in Tamil Nadu.",
        "category": "Women",
        "state_applicable": "Tamil Nadu",
        "benefits": "₹1,000 per month financial aid credited directly to the woman family head's bank account.",
        "documents_required": "Aadhaar Card, Smart Ration Card, Electricity Bill, Self-declaration form",
        "official_website": "https://www.tn.gov.in",
        "search_tags": "women allowance head household kalaignar magalir urimai tn",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 21]},
                {"<": [{"var": "annual_income"}, 250000]}
            ]
        }
    },
    {
        "name": "Tamil Nadu Old Age Pension (OAP)",
        "description": "Monthly pension assistance to destitute elderly persons, widows, and physically challenged persons in Tamil Nadu.",
        "category": "Pension",
        "state_applicable": "Tamil Nadu",
        "benefits": "₹1,000 per month pension. Free rice (up to 4 kg) and subsidised sugar.",
        "documents_required": "Aadhaar Card, Age Proof, Destitute Certificate, Bank Passbook",
        "official_website": "https://www.tn.gov.in",
        "search_tags": "elderly senior citizen pension destitute old age tamil nadu oap",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {">=": [{"var": "age"}, 60]},
                {"<": [{"var": "annual_income"}, 100000]}
            ]
        }
    },
    {
        "name": "Tamil Nadu Farmers Social Security Scheme",
        "description": "Provides social security, pension, and insurance benefits to agricultural laborers and small farmers in Tamil Nadu.",
        "category": "Pension",
        "state_applicable": "Tamil Nadu",
        "benefits": "Destitute farmer pension of ₹1,000/month after age 60. Marriage, education, and accident compensation.",
        "documents_required": "Aadhaar Card, Land ownership/cultivation proof, Landless labour certificate",
        "official_website": "https://www.tn.gov.in",
        "search_tags": "farmer social security pension labour agriculture tamil nadu",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">=": [{"var": "age"}, 60]}
            ]
        }
    },
    {
        "name": "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS - TN)",
        "description": "State health insurance scheme providing quality cashless medical care to eligible families in Tamil Nadu.",
        "category": "Health",
        "state_applicable": "Tamil Nadu",
        "benefits": "Cashless health cover up to ₹5 lakh per family per year for listed surgeries and therapies.",
        "documents_required": "Aadhaar Card, Smart Ration Card, Income Certificate from VAO",
        "official_website": "https://www.cmchistn.com",
        "search_tags": "health insurance hospital medical cover cashless chief minister cmchis tn",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {"<": [{"var": "annual_income"}, 120000]}
            ]
        }
    },

    # ─── State Schemes (Maharashtra) ───────────────────────────────────────────
    {
        "name": "Mahatma Jyotirao Phule Jan Arogya Yojana (Maharashtra)",
        "description": "Cashless health insurance scheme for eligible citizens of Maharashtra, covering surgeries and hospital stays.",
        "category": "Health",
        "state_applicable": "Maharashtra",
        "benefits": "Free medical treatment and surgery cover up to ₹5 lakh per year in empanelled hospitals.",
        "documents_required": "Aadhaar Card, Orange/Yellow Ration Card, Income Certificate",
        "official_website": "https://www.jeevandayee.gov.in",
        "search_tags": "health insurance medical cover maharashtra free cashless jyotirao phule",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Maharashtra"]},
                {"<": [{"var": "annual_income"}, 120000]}
            ]
        }
    },
    {
        "name": "Majhi Ladki Bahin Yojana (Maharashtra)",
        "description": "Financial assistance scheme for women between 21 and 65 years of age in Maharashtra to support economic independence.",
        "category": "Women",
        "state_applicable": "Maharashtra",
        "benefits": "₹1,500 per month financial aid credited directly to the woman's bank account.",
        "documents_required": "Aadhaar Card, Maharashtra Domicile, Ration Card, Income Certificate",
        "official_website": "https://ladkibahin.maharashtra.gov.in",
        "search_tags": "women monthly grant ladki bahin majhi maharashtra support girl",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Maharashtra"]},
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 21]},
                {"<=": [{"var": "age"}, 65]},
                {"<": [{"var": "annual_income"}, 250000]}
            ]
        }
    },
    {
        "name": "Sanjay Gandhi Niradhar Grant Yojana (Maharashtra)",
        "description": "Destitute monthly allowance scheme for old age, blind, disabled, and widow citizens of Maharashtra.",
        "category": "Pension",
        "state_applicable": "Maharashtra",
        "benefits": "₹1,500 per month financial assistance for single child households or destitute individuals.",
        "documents_required": "Aadhaar Card, Age Certificate, Income Certificate ( तहसीलदार ), Disability Proof",
        "official_website": "https://maharashtra.gov.in",
        "search_tags": "destitute pension disability widow maharashtra sanjay gandhi grant",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Maharashtra"]},
                {"<": [{"var": "annual_income"}, 50000]}
            ]
        }
    },
    {
        "name": "Shravanbal Seva State Pension Scheme (Maharashtra)",
        "description": "State pension support to elderly citizens above 65 years of age belonging to Below Poverty Line (BPL) families in Maharashtra.",
        "category": "Pension",
        "state_applicable": "Maharashtra",
        "benefits": "₹1,000 per month financial aid (combined with IGNOAPS benefit).",
        "documents_required": "Aadhaar Card, BPL Certificate, Age Proof, Domicile Certificate",
        "official_website": "https://maharashtra.gov.in",
        "search_tags": "senior citizen pension elderly bpl shravanbal maharashtra",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Maharashtra"]},
                {">=": [{"var": "age"}, 65]},
                {"<": [{"var": "annual_income"}, 100000]}
            ]
        }
    },

    # ─── State Schemes (Karnataka) ─────────────────────────────────────────────
    {
        "name": "Gruha Lakshmi Scheme (Karnataka)",
        "description": "Assistance scheme for women heads of households in Karnataka to support family expenses.",
        "category": "Women",
        "state_applicable": "Karnataka",
        "benefits": "₹2,000 per month direct bank transfer to the woman family head.",
        "documents_required": "Aadhaar Card of woman and husband, RC Ration Card, Mobile Number",
        "official_website": "https://sevasindhu.karnataka.gov.in",
        "search_tags": "women grant head household karnataka gruha lakshmi karnataka",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Karnataka"]},
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 18]},
                {"<": [{"var": "annual_income"}, 250000]}
            ]
        }
    },
    {
        "name": "Yuva Nidhi Scheme (Karnataka)",
        "description": "Unemployment support for graduates and diploma holders of Karnataka who passed in the recent academic year.",
        "category": "Employment",
        "state_applicable": "Karnataka",
        "benefits": "₹3,000 per month for graduates and ₹1,500 per month for diploma holders for up to 2 years.",
        "documents_required": "Aadhaar Card, Domicile, College Degree/Diploma certificate, Unemployment Declaration",
        "official_website": "https://sevasindhu.karnataka.gov.in",
        "search_tags": "unemployed youth graduate allowance karnataka yuva nidhi jobs",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Karnataka"]},
                {"==": [{"var": "is_student"}, False]},
                {"==": [{"var": "employment_status"}, "Unemployed"]},
                {"in": [{"var": "education"}, ["Graduate", "Post-Graduate", "PhD", "Higher Secondary"]]}
            ]
        }
    },

    # ─── District Level Schemes (State/District Targeted) ─────────────────────
    {
        "name": "Coimbatore District Agricultural Implement Subsidy",
        "description": "Special machinery subsidy for small-scale farmers in Coimbatore district, Tamil Nadu.",
        "category": "Agriculture",
        "state_applicable": "Tamil Nadu",
        "benefits": "50% subsidy (up to ₹30,000) for purchase of power tillers, weeding machines, and other tools.",
        "documents_required": "Aadhaar Card, Chitta/Adangal Land Records, Vaasasthalam Residence Proof, VAO cert",
        "official_website": "https://coimbatore.nic.in",
        "search_tags": "agriculture tractor machine tiller subsidy coimbatore district tn",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {"==": [{"var": "district"}, "Coimbatore"]},
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">": [{"var": "land_ownership_acres"}, 0]}
            ]
        }
    },
    {
        "name": "Chennai District Free Bicycle Distribution Scheme",
        "description": "Assistance scheme providing free bicycles to school students in Chennai district.",
        "category": "Education",
        "state_applicable": "Tamil Nadu",
        "benefits": "Free high-quality bicycle for daily school transit.",
        "documents_required": "Aadhaar Card, Smart Card, Student ID, Bonafide Certificate from school principal",
        "official_website": "https://chennai.nic.in",
        "search_tags": "cycle bicycle student school free distribute chennai district tn",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {"==": [{"var": "district"}, "Chennai"]},
                {"==": [{"var": "is_student"}, True]},
                {">=": [{"var": "age"}, 13]},
                {"<=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Pune District Tribal Student Hostel Subsidy",
        "description": "Provides boarding and lodging hostel facilities with full food subsidies for ST students in Pune district, Maharashtra.",
        "category": "Education",
        "state_applicable": "Maharashtra",
        "benefits": "100% free hostel stay and mess food charges at Pune district tribal development hostels.",
        "documents_required": "Aadhaar Card, Cast Certificate (ST), College admission confirmation, Income Certificate",
        "official_website": "https://pune.gov.in",
        "search_tags": "hostel free food tribal st student pune district maharashtra",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Maharashtra"]},
                {"==": [{"var": "district"}, "Pune"]},
                {"==": [{"var": "category"}, "ST"]},
                {"==": [{"var": "is_student"}, True]}
            ]
        }
    },
    {
        "name": "Bangalore Urban District Youth Entrepreneurship Grant",
        "description": "District-level startup seed capital for tech and service startups in Bangalore Urban, Karnataka.",
        "category": "MSME",
        "state_applicable": "Karnataka",
        "benefits": "One-time seed funding grant of ₹1,00,000 for business incubation.",
        "documents_required": "Aadhaar Card, Business registration certificate, Startup proposal, Bank Statement",
        "official_website": "https://bangaloreurban.nic.in",
        "search_tags": "startup funding grant business entrepreneur bangalore urban district",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Karnataka"]},
                {"==": [{"var": "district"}, "Bangalore Urban"]},
                {"==": [{"var": "occupation"}, "Business"]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 35]}
            ]
        }
    },
    {
        "name": "Madurai District Weaver Support Scheme",
        "description": "Special raw material subsidy and medical support for traditional handloom weavers in Madurai district.",
        "category": "Employment",
        "state_applicable": "Tamil Nadu",
        "benefits": "₹15,000 annual subsidy on yarn purchase and free premium health insurance coverage.",
        "documents_required": "Aadhaar Card, Handloom Board Membership Card, Income Certificate, VAO residency proof",
        "official_website": "https://madurai.nic.in",
        "search_tags": "weaver handloom textile subsidy madurai district yarn health",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {"==": [{"var": "district"}, "Madurai"]},
                {"==": [{"var": "occupation"}, "Self-employed"]},
                {"<": [{"var": "annual_income"}, 150000]}
            ]
        }
    }
]


class Command(BaseCommand):
    help = 'Seed 51 real/representative Indian government schemes with eligibility rules'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for data in SCHEMES_DATA:
            rule_logic = data.pop('rule')
            search_tags = data.pop('search_tags', '')

            scheme, created = Scheme.objects.get_or_create(
                name=data['name'],
                defaults={**data, 'search_tags': search_tags}
            )

            if not created:
                # Update fields if scheme already exists
                for field, value in data.items():
                    setattr(scheme, field, value)
                scheme.search_tags = search_tags
                scheme.save()
                updated_count += 1
            else:
                created_count += 1

            # Create or update the rule
            SchemeRule.objects.update_or_create(
                scheme=scheme,
                defaults={'logic': rule_logic}
            )

            status = 'Created' if created else 'Updated'
            self.stdout.write(f"[{status}]: {scheme.name}")

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! {created_count} schemes created, {updated_count} updated.'
        ))
