"""
Management command: python manage.py seed_schemes
Seeds 115+ real Indian government schemes with JSON Logic eligibility rules.
Safe to re-run — uses get_or_create/update so no duplicates are created.
"""
from django.core.management.base import BaseCommand
from schemes.models import Scheme, SchemeRule

SCHEMES_DATA = [
    # ══════════════════════════════════════════════════════════════════════════════
    # 1. CENTRAL SCHEMES — AGRICULTURE & ALLIED (10 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "description": "Direct income support of ₹6,000/year to small and marginal farmer families across India, transferred in 3 equal installments of ₹2,000 directly to bank accounts.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "₹6,000 per year direct bank transfer in 3 installments of ₹2,000 each.",
        "documents_required": "Aadhaar Card, Bank Passbook, Land Records (Khasra/Khatauni), Self-declaration form",
        "official_website": "https://pmkisan.gov.in",
        "search_tags": "farmer agriculture kisan income support land owner pm-kisan small marginal",
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
        "description": "Comprehensive yield-based crop insurance providing financial support to farmers suffering crop loss or damage arising out of natural calamities, pests, and diseases.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "Financial protection against crop loss. Low uniform premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial/horticultural crops.",
        "documents_required": "Aadhaar Card, Land Possession Certificate, Land tenancy agreement, Sowing certificate, Bank Passbook",
        "official_website": "https://pmfby.gov.in",
        "search_tags": "crop insurance agriculture farm loss damage yield drought flood pmfby",
        "rule": {
            "and": [
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">": [{"var": "land_ownership_acres"}, 0]}
            ]
        }
    },
    {
        "name": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) - Per Drop More Crop",
        "description": "Water conservation scheme providing subsidies on micro-irrigation equipment (drip and sprinkler systems) to maximize water-use efficiency.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "Up to 55% subsidy for small/marginal farmers and 45% for other farmers for micro-irrigation equipment.",
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
        "name": "Kisan Credit Card (KCC) Scheme",
        "description": "Enables farmers, fishermen, and animal husbandry rearers to receive timely and affordable credit for farming and post-harvest requirements.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "Credit limit up to ₹3 lakh at 4% effective interest rate (with prompt repayment subvention). Includes accidental insurance.",
        "documents_required": "Aadhaar Card, Land Records, Identity Proof, Address Proof, Bank Statement",
        "official_website": "https://www.rbi.org.in",
        "search_tags": "credit card loan farm loan agriculture credit short term kcc working capital",
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
        "description": "Supports organic farming clusters through financial assistance, PGS certification, and marketing support to promote soil health.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "₹50,000 per hectare financial assistance over 3 years for organic conversion, bio-inputs, and packaging.",
        "documents_required": "Aadhaar Card, Land records, Farmer Group Cluster Certificate, Bank details",
        "official_website": "https://dap.dac.gov.in",
        "search_tags": "organic farm compost bio fertilizer cluster agriculture pkvy soil health",
        "rule": {
            "and": [
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">": [{"var": "land_ownership_acres"}, 0]}
            ]
        }
    },
    {
        "name": "Agriculture Infrastructure Fund (AIF)",
        "description": "Medium-long term debt financing facility for investment in viable post-harvest management infrastructure and community farming assets.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "3% interest subvention per annum up to a limit of ₹2 crore for loans up to 7 years, along with CGTMSE credit guarantee.",
        "documents_required": "Detailed Project Report (DPR), Land ownership/lease deed, Aadhaar & PAN Card, Bank statements",
        "official_website": "https://agriinfra.dac.gov.in",
        "search_tags": "cold storage warehouse warehouse supply chain processing agriculture loan aif",
        "rule": {
            "and": [
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">=": [{"var": "age"}, 21]}
            ]
        }
    },
    {
        "name": "Pradhan Mantri Matsya Sampada Yojana (PMMSY)",
        "description": "Flagship scheme to turn fisheries into a robust commercial sector through financial and technical assistance to fishermen and fish farmers.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "40% to 60% governmental subsidy for fish seed hatcheries, biofloc units, cages, fish feed mills, and deep sea fishing vessels.",
        "documents_required": "Aadhaar Card, Fishermen ID / Cooperative Membership, Land/Water body lease proof, Bank details",
        "official_website": "https://pmmsy.dof.gov.in",
        "search_tags": "fisheries fish farming aquaculture ponds fishermen boat subsidy pmmsy",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"<": [{"var": "annual_income"}, 500000]}
            ]
        }
    },
    {
        "name": "National Livestock Mission (NLM)",
        "description": "Promotes sustainable growth of poultry, sheep, goat, and piggery farming along with feed and fodder development.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "50% capital subsidy up to ₹50 lakh for setting up breed multiplier farms and fodder entrepreneurship.",
        "documents_required": "Aadhaar Card, Land document, Training certificate in animal husbandry, Bank Account Proof",
        "official_website": "https://nlm.udyamimitra.in",
        "search_tags": "poultry goat sheep pig livestock dairy animal husbandry subsidy nlm",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"==": [{"var": "is_rural"}, True]}
            ]
        }
    },
    {
        "name": "Gramin Bhandaran Yojana (Rural Godown Scheme)",
        "description": "Capital investment subsidy for the construction and renovation of rural godowns to prevent distress sale of produce by farmers.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "25% to 33.33% capital subsidy on construction cost of agricultural storage godowns.",
        "documents_required": "Land ownership deed, Approved site layout, Bank loan sanction letter, Aadhaar",
        "official_website": "https://dmi.gov.in",
        "search_tags": "storage godown warehouse rural farm produce harvest safety subsidy",
        "rule": {
            "and": [
                {"==": [{"var": "is_rural"}, True]},
                {">": [{"var": "land_ownership_acres"}, 0]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Sub-Mission on Agricultural Mechanization (SMAM)",
        "description": "Financial assistance for farm machinery, tractors, power tillers, and custom hiring centers to make farming efficient.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "40% to 50% subsidy on purchase of agricultural implements and machinery.",
        "documents_required": "Aadhaar Card, Land Record documents, Bank Passbook copy, Quotation from authorized dealer",
        "official_website": "https://agrimachinery.nic.in",
        "search_tags": "tractor machinery power tiller harvesters implements subsidy smam",
        "rule": {
            "and": [
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">": [{"var": "land_ownership_acres"}, 0]}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 2. CENTRAL SCHEMES — EDUCATION & SCHOLARSHIPS (12 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "Post Matric Scholarship for SC Students",
        "description": "Centrally sponsored scholarship providing complete financial assistance to Scheduled Caste students studying at post-matriculation or post-secondary stages.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "100% reimbursement of non-refundable tuition fees plus monthly maintenance allowance (up to ₹13,500/year).",
        "documents_required": "Aadhaar Card, SC Caste Certificate, Income Certificate (family income < ₹2.5L), 10th/12th Marksheets, College ID",
        "official_website": "https://scholarships.gov.in",
        "search_tags": "scholarship sc student post matric college university tuition fee",
        "rule": {
            "and": [
                {"==": [{"var": "category"}, "SC"]},
                {"<=": [{"var": "annual_income"}, 250000]},
                {"==": [{"var": "is_student"}, True]},
                {">=": [{"var": "age"}, 15]}
            ]
        }
    },
    {
        "name": "Post Matric Scholarship for ST Students",
        "description": "Financial support to Scheduled Tribe students across India for pursuing higher education from Class 11 up to PhD level.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "Full tuition fee reimbursement + monthly living allowance + book allowances.",
        "documents_required": "Aadhaar Card, ST Caste Certificate, Family Income Certificate (< ₹2.5L), Previous class marksheets, College fee receipt",
        "official_website": "https://scholarships.gov.in",
        "search_tags": "scholarship st tribal student post matric college university fee",
        "rule": {
            "and": [
                {"==": [{"var": "category"}, "ST"]},
                {"<=": [{"var": "annual_income"}, 250000]},
                {"==": [{"var": "is_student"}, True]},
                {">=": [{"var": "age"}, 15]}
            ]
        }
    },
    {
        "name": "Post Matric Scholarship for OBC / EBC / DNT Students",
        "description": "Scholarship assistance to Other Backward Classes, Economically Backward Classes, and De-notified Tribes for higher studies.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "Tuition fee waiver and maintenance allowance up to ₹10,000 per academic year.",
        "documents_required": "Aadhaar Card, OBC/EBC Certificate, Income Certificate (< ₹2.5L), Academic Transcripts, Bank Passbook",
        "official_website": "https://scholarships.gov.in",
        "search_tags": "scholarship obc ebc student college university tuition fees",
        "rule": {
            "and": [
                {"==": [{"var": "category"}, "OBC"]},
                {"<=": [{"var": "annual_income"}, 250000]},
                {"==": [{"var": "is_student"}, True]},
                {">=": [{"var": "age"}, 15]}
            ]
        }
    },
    {
        "name": "AICTE Pragati Scholarship for Girl Students",
        "description": "Scholarship by AICTE to empower meritorious young women pursuing technical diploma or degree courses in approved institutions.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "₹50,000 per year towards college fee payment, computer purchase, stationery, and books for up to 4 years.",
        "documents_required": "Aadhaar Card, 10th/12th Marksheet, AICTE college admission letter, Family Income Certificate (< ₹8L)",
        "official_website": "https://www.aicte-india.org",
        "search_tags": "aicte pragati scholarship girl woman female engineering diploma technical student",
        "rule": {
            "and": [
                {"==": [{"var": "gender"}, "Female"]},
                {"==": [{"var": "is_student"}, True]},
                {"<=": [{"var": "annual_income"}, 800000]},
                {">=": [{"var": "age"}, 17]},
                {"<=": [{"var": "age"}, 25]}
            ]
        }
    },
    {
        "name": "National Means-cum-Merit Scholarship Scheme (NMMSS)",
        "description": "Financial incentive awarded to meritorious students from economically weaker sections to arrest dropouts at Class 8 and encourage high school completion.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "₹12,000 per year (₹1,000/month) from Class 9 to Class 12.",
        "documents_required": "Class 7/8 Marksheet (min 55%), Income Certificate (< ₹3.5L), Aadhaar Card, Bank details",
        "official_website": "https://scholarships.gov.in",
        "search_tags": "school scholarship nmms merit high school class 9 10 11 12 student",
        "rule": {
            "and": [
                {"==": [{"var": "is_student"}, True]},
                {"<=": [{"var": "annual_income"}, 350000]},
                {">=": [{"var": "age"}, 12]},
                {"<=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Central Sector Scheme of Scholarship for College and University Students (PM-USP)",
        "description": "Scholarship for top percentile scorers in Class 12 board examinations pursuing regular graduate and post-graduate degree courses.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "₹12,000/year for first 3 years of graduation; ₹20,000/year for post-graduate courses.",
        "documents_required": "12th Board Marksheet (>80th percentile), Family Income Certificate (< ₹4.5L), College Bonafide, Aadhaar",
        "official_website": "https://scholarships.gov.in",
        "search_tags": "central sector scholarship pm usp degree graduate college merit 12th pass",
        "rule": {
            "and": [
                {"==": [{"var": "is_student"}, True]},
                {"<=": [{"var": "annual_income"}, 450000]},
                {">=": [{"var": "age"}, 17]},
                {"<=": [{"var": "age"}, 25]}
            ]
        }
    },
    {
        "name": "Begum Hazrat Mahal National Scholarship",
        "description": "Scholarship exclusively for meritorious girl students belonging to minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi).",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "₹6,000/year for classes 9 & 10; ₹12,000/year for classes 11 & 12.",
        "documents_required": "Minority Community Certificate, Marksheet with min 50% marks, Income Certificate (< ₹2L), Aadhaar",
        "official_website": "https://bhmnsmaef.org",
        "search_tags": "begum hazrat mahal minority girl student scholarship muslim christian jain",
        "rule": {
            "and": [
                {"==": [{"var": "gender"}, "Female"]},
                {"==": [{"var": "is_student"}, True]},
                {"<=": [{"var": "annual_income"}, 200000]},
                {">=": [{"var": "age"}, 13]},
                {"<=": [{"var": "age"}, 19]}
            ]
        }
    },
    {
        "name": "PM Young Achievers Scholarship Award Scheme for PM-YASASVI",
        "description": "Top-class education and hostel facility scholarship for meritorious OBC, EBC, and DNT students studying in designated top schools and colleges.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "Up to ₹75,000/year for Class 9-10 and ₹1,25,000/year for Class 11-12 plus full college fees.",
        "documents_required": "YASASVI entrance test rank card / Marksheet, Category certificate, Income certificate (< ₹2.5L), Aadhaar",
        "official_website": "https://yet.nta.ac.in",
        "search_tags": "yasasvi scholarship obc ebc dnt nta high school college merit",
        "rule": {
            "and": [
                {"in": [{"var": "category"}, ["OBC", "General"]]},
                {"==": [{"var": "is_student"}, True]},
                {"<=": [{"var": "annual_income"}, 250000]},
                {">=": [{"var": "age"}, 14]},
                {"<=": [{"var": "age"}, 22]}
            ]
        }
    },
    {
        "name": "Saksham Scholarship Scheme for Differently Abled Students",
        "description": "AICTE scholarship to support specially-abled students with more than 40% disability in pursuing technical degree/diploma education.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "₹50,000 per year towards tuition fees and technical assistance aids.",
        "documents_required": "Disability Certificate (>40%), AICTE college admission letter, Income certificate (< ₹8L), Aadhaar",
        "official_website": "https://www.aicte-india.org",
        "search_tags": "saksham disability scholarship handicapped technical college aicte",
        "rule": {
            "and": [
                {"==": [{"var": "disability_status"}, True]},
                {"==": [{"var": "is_student"}, True]},
                {"<=": [{"var": "annual_income"}, 800000]},
                {">=": [{"var": "age"}, 16]}
            ]
        }
    },
    {
        "name": "National Fellowship for OBC Students (NFOBC)",
        "description": "Fellowship to support OBC candidates pursuing regular M.Phil and Ph.D degrees in Sciences, Humanities, and Social Sciences.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "₹31,000/month for JRF and ₹35,000/month for SRF + annual contingency grant.",
        "documents_required": "OBC Certificate, UGC-NET/CSIR-NET result, University PhD registration proof, Income Certificate",
        "official_website": "https://www.ugc.ac.in",
        "search_tags": "fellowship phd mphil research obc ugc net stipend higher education",
        "rule": {
            "and": [
                {"==": [{"var": "category"}, "OBC"]},
                {"==": [{"var": "is_student"}, True]},
                {"<=": [{"var": "annual_income"}, 600000]},
                {">=": [{"var": "age"}, 21]},
                {"<=": [{"var": "age"}, 35]}
            ]
        }
    },
    {
        "name": "National Fellowship for SC Students (NFSC)",
        "description": "UGC fellowship for Scheduled Caste researchers pursuing full-time doctoral research (M.Phil / Ph.D).",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "₹31,000 to ₹35,000 per month stipend plus annual contingency grant and HRA.",
        "documents_required": "SC Caste Certificate, UGC-NET scorecard, PhD Enrolment Certificate, Aadhaar",
        "official_website": "https://www.ugc.ac.in",
        "search_tags": "nfsc fellowship sc student research phd doctorate ugc net stipend",
        "rule": {
            "and": [
                {"==": [{"var": "category"}, "SC"]},
                {"==": [{"var": "is_student"}, True]},
                {">=": [{"var": "age"}, 21]},
                {"<=": [{"var": "age"}, 36]}
            ]
        }
    },
    {
        "name": "Padho Pardesh Scheme (Interest Subsidy on Education Loans for Overseas Studies)",
        "description": "Interest subsidy for minority students availing education loans for pursuing Masters, M.Phil, or Ph.D abroad.",
        "category": "Education",
        "state_applicable": "All",
        "benefits": "100% interest subsidy during the moratorium period on education loans taken from scheduled banks.",
        "documents_required": "Minority Certificate, Foreign University Offer Letter, Bank Education Loan sanction letter, Income Certificate (< ₹6L)",
        "official_website": "https://minorityaffairs.gov.in",
        "search_tags": "study abroad overseas education loan interest subsidy minority masters phd",
        "rule": {
            "and": [
                {"==": [{"var": "is_student"}, True]},
                {"<=": [{"var": "annual_income"}, 600000]},
                {">=": [{"var": "age"}, 19]}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 3. CENTRAL SCHEMES — WOMEN & CHILD WELFARE (10 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        "description": "Maternity benefit cash incentive for pregnant women and lactating mothers for first and second living child (if second child is a girl).",
        "category": "Women",
        "state_applicable": "All",
        "benefits": "₹5,000 for first child in two installments; additional ₹6,000 for second child if girl child.",
        "documents_required": "Mother and Child Protection (MCP) Card, Aadhaar Card, Bank Passbook linked to Aadhaar",
        "official_website": "https://pmmvy.wcd.gov.in",
        "search_tags": "maternity pregnant mother infant newborn cash nutrition pmmvy",
        "rule": {
            "and": [
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 19]},
                {"<=": [{"var": "age"}, 45]},
                {"<": [{"var": "annual_income"}, 800000]}
            ]
        }
    },
    {
        "name": "Sukanya Samriddhi Yojana (SSY)",
        "description": "High-interest, tax-free small savings scheme under Beti Bachao Beti Padhao for girl children below 10 years of age.",
        "category": "Women",
        "state_applicable": "All",
        "benefits": "8.2% guaranteed tax-free annual interest rate with Section 80C tax deductions and partial withdrawal for higher education.",
        "documents_required": "Girl Child Birth Certificate, Parent/Guardian Aadhaar & PAN Card, Address Proof",
        "official_website": "https://www.indiapost.gov.in",
        "search_tags": "girl child savings daughter future education marriage tax free ssy beti bachao",
        "rule": {
            ">=": [{"var": "family_size"}, 2]
        }
    },
    {
        "name": "Pradhan Mantri Ujjwala Yojana (PMUY 2.0)",
        "description": "Free LPG gas connection with first refill and hotplate free of cost to adult women from poor BPL households.",
        "category": "Women",
        "state_applicable": "All",
        "benefits": "Deposit-free LPG cylinder connection, free stove, and initial refill + ongoing ₹300 subsidy per cylinder.",
        "documents_required": "Aadhaar Card of adult woman, Ration Card / BPL card, Bank Passbook, Supplementary family declaration",
        "official_website": "https://pmuy.gov.in",
        "search_tags": "lpg gas cylinder cooking fuel free connection ujjwala bpl poor women",
        "rule": {
            "and": [
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "annual_income"}, 200000]}
            ]
        }
    },
    {
        "name": "Mahila Samman Savings Certificate",
        "description": "Government-backed one-time small savings scheme offering high fixed return for women and girls for a 2-year tenure.",
        "category": "Women",
        "state_applicable": "All",
        "benefits": "Fixed 7.5% compound quarterly interest with partial withdrawal facility up to ₹2,00,000.",
        "documents_required": "Aadhaar Card, PAN Card, KYC Form, Passport size photos",
        "official_website": "https://www.indiapost.gov.in",
        "search_tags": "mahila samman fixed deposit savings woman post office bank interest",
        "rule": {
            "==": [{"var": "gender"}, "Female"]
        }
    },
    {
        "name": "Stand-Up India Scheme for Women & SC/ST Entrepreneurs",
        "description": "Bank loans between ₹10 lakh and ₹1 crore to at least one woman and one SC/ST borrower per bank branch for greenfield enterprises.",
        "category": "Women",
        "state_applicable": "All",
        "benefits": "Bank loans from ₹10 lakh to ₹1 crore with minimal margin money requirement (15%) and credit guarantee support.",
        "documents_required": "Project Report, Identity Proof, Caste Certificate (if SC/ST), PAN, Business registration",
        "official_website": "https://www.standupmitra.in",
        "search_tags": "business loan women entrepreneur sc st start enterprise factory standup india",
        "rule": {
            "and": [
                {"or": [
                    {"==": [{"var": "gender"}, "Female"]},
                    {"in": [{"var": "category"}, ["SC", "ST"]]}
                ]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Mahila Coir Yojana",
        "description": "Self-employment program providing motorized coir spinning ratts to women artisans at 75% governmental subsidy.",
        "category": "Women",
        "state_applicable": "All",
        "benefits": "75% subsidy on cost of motorized coir spinning equipment along with 2-month paid stipend skill training.",
        "documents_required": "Aadhaar Card, Coir Board training completion certificate, Bank passbook, Passport photos",
        "official_website": "https://coirboard.gov.in",
        "search_tags": "coir spinning handicraft women rural cottage industry artisan subsidy",
        "rule": {
            "and": [
                {"==": [{"var": "gender"}, "Female"]},
                {"==": [{"var": "is_rural"}, True]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Working Women Hostel Scheme (Sakhi Niwas)",
        "description": "Safe, secure, and affordable hostel accommodation with daycare facilities for working women in urban, semi-urban, and rural areas.",
        "category": "Women",
        "state_applicable": "All",
        "benefits": "Subsidized safe boarding, lodging, security, and day-care (crèche) facilities for infants of working women.",
        "documents_required": "Employment letter / Salary certificate, Identity proof, Address proof, Employer verification",
        "official_website": "https://wcd.nic.in",
        "search_tags": "hostel room accommodation working woman single city rent safe sakhi niwas",
        "rule": {
            "and": [
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "annual_income"}, 600000]}
            ]
        }
    },
    {
        "name": "One Stop Centre Scheme (Sakhi Centre)",
        "description": "24/7 integrated support and assistance under one roof to women affected by violence, including medical, legal, psychological, and temporary shelter.",
        "category": "Women",
        "state_applicable": "All",
        "benefits": "Free emergency response, medical aid, police assistance, psycho-social counselling, and temporary stay up to 5 days.",
        "documents_required": "Identity Proof (if available), None strictly mandatory in emergency",
        "official_website": "https://wcd.nic.in",
        "search_tags": "sakhi shelter violence legal aid protection domestic emergency helpline woman",
        "rule": {
            "==": [{"var": "gender"}, "Female"]
        }
    },
    {
        "name": "TREAD Scheme (Trade Related Entrepreneurship Assistance and Development for Women)",
        "description": "Promotes enterprise creation among women through NGO-assisted government grants of up to 30% of total project cost.",
        "category": "Women",
        "state_applicable": "All",
        "benefits": "Government grant up to 30% of total project value for micro-enterprises run by women SHGs/entrepreneurs.",
        "documents_required": "Project proposal via partnering NGO/financial institution, Aadhaar, Bank details",
        "official_website": "https://msme.gov.in",
        "search_tags": "trade business grant women shg micro enterprise tread self employed",
        "rule": {
            "and": [
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Kishori Shakti Yojana (KSY)",
        "description": "Holistic adolescent girl development program improving nutritional status, life skills, vocational training, and health awareness.",
        "category": "Women",
        "state_applicable": "All",
        "benefits": "Free iron-folic supplementation, nutritional support, vocational guidance, and health check-ups at Anganwadi centers.",
        "documents_required": "Anganwadi registration / Aadhaar Card, Age proof",
        "official_website": "https://wcd.nic.in",
        "search_tags": "adolescent girls anganwadi health nutrition skill training teen kishori",
        "rule": {
            "and": [
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 11]},
                {"<=": [{"var": "age"}, 18]},
                {"<": [{"var": "annual_income"}, 200000]}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 4. CENTRAL SCHEMES — HEALTHCARE & INSURANCE (8 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "Ayushman Bharat — Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
        "description": "World's largest health assurance scheme providing free secondary and tertiary hospitalization cover of ₹5 lakh per family per year.",
        "category": "Healthcare",
        "state_applicable": "All",
        "benefits": "₹5,00,000 cashless hospitalization coverage per family/year across empanelled public and private hospitals nationwide.",
        "documents_required": "Aadhaar Card, Ration Card / SECC 2011 Name Match, Ayushman Card",
        "official_website": "https://pmjay.gov.in",
        "search_tags": "health insurance free hospital treatment surgery medical card ayushman pmjay",
        "rule": {
            "<=": [{"var": "annual_income"}, 250000]
        }
    },
    {
        "name": "Ayushman Bharat PM-JAY for Senior Citizens (70+ Years)",
        "description": "Universal cashless healthcare cover of ₹5 lakh per year for ALL senior citizens aged 70 years and above, irrespective of income.",
        "category": "Healthcare",
        "state_applicable": "All",
        "benefits": "Dedicated top-up health insurance of ₹5,00,000 per year exclusively for senior citizens aged 70+.",
        "documents_required": "Aadhaar Card (verifying age >= 70), E-KYC verification",
        "official_website": "https://beneficiary.nha.gov.in",
        "search_tags": "senior citizen 70 plus health insurance hospital ayushman old age free medical",
        "rule": {
            ">=": [{"var": "age"}, 70]
        }
    },
    {
        "name": "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
        "description": "Accident insurance scheme offering death and disability cover at an extremely nominal premium of ₹20 per year.",
        "category": "Healthcare",
        "state_applicable": "All",
        "benefits": "₹2,00,000 on accidental death or permanent total disability; ₹1,00,000 for permanent partial disability for ₹20/year.",
        "documents_required": "Aadhaar Card, Savings Bank Account, Auto-debit consent form",
        "official_website": "https://financialservices.gov.in",
        "search_tags": "accident insurance accidental death handicap injury 20 rupees pmsby",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 70]}
            ]
        }
    },
    {
        "name": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
        "description": "One-year renewable life insurance scheme offering ₹2 lakh life cover on death due to any reason for ₹436/year.",
        "category": "Healthcare",
        "state_applicable": "All",
        "benefits": "₹2,00,000 life insurance death benefit paid to nominee for annual premium of ₹436.",
        "documents_required": "Aadhaar Card, Bank Account, Consent for auto-debit of premium",
        "official_website": "https://financialservices.gov.in",
        "search_tags": "life insurance death cover term plan 436 rupees bank pmjjby",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 50]}
            ]
        }
    },
    {
        "name": "Rashtriya Arogya Nidhi (RAN)",
        "description": "One-time financial assistance to poor patients suffering from major life-threatening diseases for treatment at super-specialty government hospitals.",
        "category": "Healthcare",
        "state_applicable": "All",
        "benefits": "Direct financial aid up to ₹15,00,000 for specialized surgery and treatment for cancer, organ failure, etc.",
        "documents_required": "BPL Card / Income Certificate (< ₹1.5L), Medical cost estimate from hospital superintendent, Aadhaar",
        "official_website": "https://mohfw.gov.in",
        "search_tags": "cancer kidney heart surgery critical illness financial help hospital ran",
        "rule": {
            "<=": [{"var": "annual_income"}, 150000]
        }
    },
    {
        "name": "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)",
        "description": "Provides high-quality generic medicines, surgical equipment, and health products at 50% to 90% lesser price than branded equivalents.",
        "category": "Healthcare",
        "state_applicable": "All",
        "benefits": "Access to 2,000+ generic medicines and 300+ surgical items at steep discounts.",
        "documents_required": "Doctor's Prescription (No ID restriction)",
        "official_website": "https://janaushadhi.gov.in",
        "search_tags": "generic medicine cheap pharmacy discount drugs medical store janaushadhi",
        "rule": {
            ">=": [{"var": "age"}, 0]
        }
    },
    {
        "name": "National Health Mission — Free Essential Drugs & Diagnostics",
        "description": "Free provision of essential medicines, diagnostic tests, blood, and ambulance services (108/102) across all public health facilities.",
        "category": "Healthcare",
        "state_applicable": "All",
        "benefits": "Zero-cost diagnostic tests and essential medicines in all government PHCs, CHCs, and District Hospitals.",
        "documents_required": "Hospital OPD registration card, Aadhaar",
        "official_website": "https://nhm.gov.in",
        "search_tags": "free medicine blood test x-ray ultrasound government hospital phc nhm",
        "rule": {
            ">=": [{"var": "age"}, 0]
        }
    },
    {
        "name": "Nikshay Poshan Yojana for TB Patients",
        "description": "Direct benefit transfer providing nutritional support to all notified Tuberculosis patients throughout treatment duration.",
        "category": "Healthcare",
        "state_applicable": "All",
        "benefits": "₹500 to ₹1,000 per month direct bank transfer for food and nutrition until full recovery.",
        "documents_required": "Nikshay ID (from TB center), Aadhaar Card, Bank Account Passbook",
        "official_website": "https://nikshay.in",
        "search_tags": "tuberculosis tb medicine nutrition food dbt nikshay cash support",
        "rule": {
            ">=": [{"var": "age"}, 0]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 5. CENTRAL SCHEMES — HOUSING & SANITATION (6 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "Pradhan Mantri Awas Yojana — Gramin (PMAY-G)",
        "description": "Financial assistance for construction of permanent pucca houses with clean cooking spaces to homeless and kutcha house dwellers in rural areas.",
        "category": "Housing",
        "state_applicable": "All",
        "benefits": "₹1,20,000 in plain areas; ₹1,30,000 in hilly/difficult states + ₹12,000 toilet grant + 90 days MGNREGA wages.",
        "documents_required": "Aadhaar Card, Job Card number (MGNREGA), Bank details, Land title/allotment letter",
        "official_website": "https://pmayg.nic.in",
        "search_tags": "house construction rural village home grant pucca makaan pmay-g",
        "rule": {
            "and": [
                {"==": [{"var": "is_rural"}, True]},
                {"<=": [{"var": "annual_income"}, 200000]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Pradhan Mantri Awas Yojana — Urban (PMAY-U 2.0)",
        "description": "Interest subsidy and financial assistance to urban poor, lower income groups (LIG), and middle income groups (MIG) to purchase or construct a home.",
        "category": "Housing",
        "state_applicable": "All",
        "benefits": "Up to ₹2.67 lakh interest subsidy on home loans under Credit Linked Subsidy Scheme (CLSS).",
        "documents_required": "Aadhaar Card, Income Certificate, Property Documents, Bank loan sanction letter, Pan Card",
        "official_website": "https://pmaymis.gov.in",
        "search_tags": "urban house flat flat subsidy home loan interest clss pmay-u city home",
        "rule": {
            "and": [
                {"==": [{"var": "is_rural"}, False]},
                {"<=": [{"var": "annual_income"}, 900000]},
                {">=": [{"var": "age"}, 21]}
            ]
        }
    },
    {
        "name": "Swachh Bharat Mission — Individual Household Latrine (IHHL)",
        "description": "Direct financial incentive to rural and urban households to construct an individual household sanitary latrine.",
        "category": "Housing",
        "state_applicable": "All",
        "benefits": "₹12,000 direct bank transfer for construction of twin-pit toilet.",
        "documents_required": "Aadhaar Card, Bank Passbook copy, Photo of beneficiary with constructed toilet",
        "official_website": "https://swachhbharatmission.gov.in",
        "search_tags": "toilet latrine sanitation bathroom subsidy swachh bharat ihhl",
        "rule": {
            "and": [
                {"<=": [{"var": "annual_income"}, 250000]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Jal Jeevan Mission (Har Ghar Jal)",
        "description": "Provides functional household tap connection delivering potable drinking water at 55 liters per capita per day to every rural home.",
        "category": "Housing",
        "state_applicable": "All",
        "benefits": "Free piped drinking tap water connection installed directly inside home compound.",
        "documents_required": "Village resident proof, Aadhaar Card",
        "official_website": "https://jaljeevanmission.gov.in",
        "search_tags": "water tap connection clean drinking pipeline rural village har ghar jal",
        "rule": {
            "==": [{"var": "is_rural"}, True]
        }
    },
    {
        "name": "PM Surya Ghar: Muft Bijli Yojana (Rooftop Solar Subsidy)",
        "description": "Subsidy scheme to install solar rooftop systems on residential households, providing up to 300 units of free electricity every month.",
        "category": "Housing",
        "state_applicable": "All",
        "benefits": "₹30,000 for 1kW system, ₹60,000 for 2kW, and ₹78,000 for 3kW or higher solar rooftop systems.",
        "documents_required": "Electricity Bill, Roof ownership certificate, Aadhaar, Bank passbook",
        "official_website": "https://pmsuryaghar.gov.in",
        "search_tags": "solar rooftop electricity power bill free muft bijli renewable panel subsidy",
        "rule": {
            ">=": [{"var": "age"}, 18]
        }
    },
    {
        "name": "Affordable Rental Housing Complexes (ARHCs)",
        "description": "Provides ease of living and affordable dignified rental housing close to workplace for urban migrants and poor near industrial areas.",
        "category": "Housing",
        "state_applicable": "All",
        "benefits": "Low monthly rental housing with piped water, electricity, sanitation, and security near city industrial clusters.",
        "documents_required": "Aadhaar Card, Employer / Labor Contractor ID, Proof of migration",
        "official_website": "https://arhc.mohua.gov.in",
        "search_tags": "rental house migrant room labor rent cheap room city industrial housing",
        "rule": {
            "and": [
                {"==": [{"var": "is_rural"}, False]},
                {"<=": [{"var": "annual_income"}, 300000]}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 6. CENTRAL SCHEMES — MSME, ENTREPRENEURSHIP & BUSINESS (10 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "PM Mudra Loan — Shishu Category",
        "description": "Collateral-free micro-loans up to ₹50,000 for small shopkeepers, fruit vendors, artisans, and startup entrepreneurs.",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "Collateral-free loan up to ₹50,000 at competitive bank interest rates with low processing fee.",
        "documents_required": "Aadhaar Card, PAN Card, Business Address proof, Bank statement, Quotation of items to purchase",
        "official_website": "https://www.mudra.org.in",
        "search_tags": "loan small business mudra shishu shopkeeper vendor micro loan",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"in": [{"var": "occupation"}, ["Self-employed", "Artisan", "Unemployed"]]}
            ]
        }
    },
    {
        "name": "PM Mudra Loan — Kishor Category",
        "description": "Working capital and machinery purchase loan between ₹50,000 and ₹5,00,000 for growing micro-enterprises.",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "Loan from ₹50,000 up to ₹5 lakh without mortgage requirement.",
        "documents_required": "Aadhaar, PAN, Last 6 months bank statement, Business Registration / Udyam Certificate, Quotation",
        "official_website": "https://www.mudra.org.in",
        "search_tags": "mudra kishor business loan 5 lakh machinery workshop store",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"==": [{"var": "occupation"}, "Self-employed"]}
            ]
        }
    },
    {
        "name": "PM Mudra Loan — Tarun Category",
        "description": "Business expansion loan between ₹5,00,000 and ₹20,00,000 for established small businesses and manufacturing units.",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "Credit facility from ₹5 lakh up to ₹20 lakh with credit guarantee protection under CGFMU.",
        "documents_required": "Aadhaar, PAN, 2 years ITR / Financial Statements, Udyam Registration, Bank Statements",
        "official_website": "https://www.mudra.org.in",
        "search_tags": "mudra tarun business loan expansion machinery 10 lakh 20 lakh",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"==": [{"var": "occupation"}, "Self-employed"]}
            ]
        }
    },
    {
        "name": "PM SVANidhi (Street Vendor's AtmaNirbhar Nidhi)",
        "description": "Collateral-free working capital micro-credit for urban street vendors, hawkers, and cart owners with 7% interest subsidy.",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "Initial ₹10,000 loan; on timely repayment unlocks ₹20,000 (2nd tranche) and ₹50,000 (3rd tranche) + ₹1,200 cashback on digital transactions.",
        "documents_required": "Aadhaar Card, Vending Certificate / Letter of Recommendation from Urban Local Body, Bank Account",
        "official_website": "https://pmsvanidhi.mohua.gov.in",
        "search_tags": "street vendor hawker cart loan 10000 small credit svanidhi urban",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "annual_income"}, 200000]}
            ]
        }
    },
    {
        "name": "PM Vishwakarma Scheme",
        "description": "End-to-end holistic support for traditional artisans and craftspeople across 18 trades (carpenters, blacksmiths, potters, cobblers, tailors, etc.).",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "PM Vishwakarma Certificate & ID, ₹15,000 toolkit incentive, free basic/advanced skill training with ₹500/day stipend, and ₹3 lakh collateral-free loan at 5% interest.",
        "documents_required": "Aadhaar Card, Mobile Number, Bank Details, Ration Card, Skill Trade Self-Declaration",
        "official_website": "https://pmvishwakarma.gov.in",
        "search_tags": "vishwakarma artisan carpenter tailor blacksmith potter toolkit stipend 15000 loan",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"in": [{"var": "occupation"}, ["Artisan", "Self-employed", "Daily Wage Laborer"]]}
            ]
        }
    },
    {
        "name": "PMEGP (Prime Minister Employment Generation Programme)",
        "description": "Credit-linked capital subsidy scheme for setting up new micro-enterprises in manufacturing (up to ₹50L) and service sectors (up to ₹20L).",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "15% to 35% government margin money subsidy on project cost (up to ₹50 lakh for manufacturing).",
        "documents_required": "Project Report (DPR), Aadhaar, Caste/Category Certificate (if applicable), 8th pass certificate, EDP training certificate",
        "official_website": "https://www.kviconline.gov.in",
        "search_tags": "pmegp business factory subsidy kvic loan manufacturing service new enterprise",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"in": [{"var": "employment_status"}, ["Unemployed", "Self-Employed"]]}
            ]
        }
    },
    {
        "name": "Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)",
        "description": "Enables first-generation entrepreneurs and MSMEs to access collateral-free credit from financial institutions.",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "Collateral-free bank loans up to ₹5 crore with 75% to 85% credit guarantee covered by government.",
        "documents_required": "Detailed Project Report, Udyam Registration, Financial statements, Bank Application",
        "official_website": "https://www.cgtmse.in",
        "search_tags": "cgtmse collateral free loan 5 crore msme factory industry bank guarantee",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 21]},
                {"==": [{"var": "occupation"}, "Self-employed"]}
            ]
        }
    },
    {
        "name": "MSME Champions Scheme (Zed Certification & Technology Upgradation)",
        "description": "Financial assistance for Zero Defect Zero Effect (ZED) quality certification and cleaner manufacturing technologies.",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "Up to 80% subsidy on cost of ZED certification (Bronze, Silver, Gold) and handholding support.",
        "documents_required": "Udyam Registration Certificate, PAN, Factory layout, Pollution control consent",
        "official_website": "https://zed.msme.gov.in",
        "search_tags": "zed certification msme quality export subsidy technology champions",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"==": [{"var": "occupation"}, "Self-employed"]}
            ]
        }
    },
    {
        "name": "SFURTI (Scheme of Fund for Regeneration of Traditional Industries)",
        "description": "Organizes traditional artisans and rural craftspeople into modern producer clusters with common facility centers (CFC) and marketing aid.",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "Financial assistance up to ₹2.5 crore for regular cluster and ₹5 crore for major cluster development.",
        "documents_required": "Cluster registration documents, SPV formation letter, Detailed Project Report",
        "official_website": "https://sfurti.msme.gov.in",
        "search_tags": "sfurti artisan cluster traditional craft handloom pottery bamboo coir",
        "rule": {
            "and": [
                {"==": [{"var": "is_rural"}, True]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "ASPIRE (A Scheme for Promotion of Innovation, Rural Industries and Entrepreneurship)",
        "description": "Sets up Livelihood Business Incubators (LBI) and Technology Business Incubators (TBI) to commercialize agro-rural innovations.",
        "category": "MSME",
        "state_applicable": "All",
        "benefits": "100% financial grant up to ₹1 crore for plant and machinery of Livelihood Business Incubators.",
        "documents_required": "Incubation proposal, Proof of educational/research society registration",
        "official_website": "https://aspire.msme.gov.in",
        "search_tags": "aspire incubation agro business startup rural innovation technology",
        "rule": {
            ">=": [{"var": "age"}, 20]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 7. CENTRAL SCHEMES — SOCIAL WELFARE, PENSIONS & SENIOR CITIZENS (10 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "Atal Pension Yojana (APY)",
        "description": "Government-backed guaranteed pension scheme for unorganized sector workers offering guaranteed monthly pension from age 60.",
        "category": "Senior Citizens",
        "state_applicable": "All",
        "benefits": "Guaranteed monthly pension of ₹1,00,0, ₹2,000, ₹3,000, ₹4,000, or ₹5,000 from age 60 for lifetime.",
        "documents_required": "Aadhaar Card, Savings Bank Account with auto-debit facility, Mobile Number",
        "official_website": "https://www.npscra.nsdl.co.in",
        "search_tags": "atal pension yojana apy old age monthly pension 5000 unorganized",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 40]}
            ]
        }
    },
    {
        "name": "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
        "description": "Monthly social security pension for destitute senior citizens living below the poverty line.",
        "category": "Senior Citizens",
        "state_applicable": "All",
        "benefits": "Monthly pension of ₹200 to ₹500 (plus additional state top-up up to ₹1,500/month).",
        "documents_required": "BPL Card, Age Proof (Aadhaar/Voter ID), Bank Passbook, Passport size photos",
        "official_website": "https://nsap.nic.in",
        "search_tags": "old age pension senior citizen monthly cash bpl poor ignoaps nsap",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 60]},
                {"<=": [{"var": "annual_income"}, 120000]}
            ]
        }
    },
    {
        "name": "Indira Gandhi National Widow Pension Scheme (IGNWPS)",
        "description": "Monthly pension for destitute widows aged between 40 and 79 years living below the poverty line.",
        "category": "Social Welfare",
        "state_applicable": "All",
        "benefits": "Monthly pension of ₹300 (plus state government top-up up to ₹2,000/month) transferred directly to bank account.",
        "documents_required": "Husband's Death Certificate, BPL Card, Age Proof, Aadhaar, Bank Details",
        "official_website": "https://nsap.nic.in",
        "search_tags": "widow pension destitute woman monthly cash support ignwps nsap",
        "rule": {
            "and": [
                {"==": [{"var": "gender"}, "Female"]},
                {"==": [{"var": "marital_status"}, "Widowed"]},
                {">=": [{"var": "age"}, 40]},
                {"<=": [{"var": "annual_income"}, 150000]}
            ]
        }
    },
    {
        "name": "Indira Gandhi National Disability Pension Scheme (IGNDPS)",
        "description": "Monthly social assistance pension for severely and multiple disabled persons living below poverty line.",
        "category": "Disability",
        "state_applicable": "All",
        "benefits": "Monthly pension of ₹300 (plus state top-up ranging between ₹1,000 and ₹3,000/month).",
        "documents_required": "Disability Certificate (min 80% disability), BPL Card, Aadhaar Card, Bank Passbook",
        "official_website": "https://nsap.nic.in",
        "search_tags": "disability pension handicap severely disabled monthly pension igndps",
        "rule": {
            "and": [
                {"==": [{"var": "disability_status"}, True]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "annual_income"}, 150000]}
            ]
        }
    },
    {
        "name": "National Family Benefit Scheme (NFBS)",
        "description": "Lump-sum financial assistance of ₹20,000 to a BPL household on the death of the primary breadwinner.",
        "category": "Social Welfare",
        "state_applicable": "All",
        "benefits": "One-time lump sum grant of ₹20,000 directly transferred to the surviving family member's bank account.",
        "documents_required": "Death Certificate of breadwinner, BPL Certificate / Income Proof, Age proof of deceased (18-59 years), Bank details",
        "official_website": "https://nsap.nic.in",
        "search_tags": "death of breadwinner family grant lump sum 20000 emergency assistance nfbs",
        "rule": {
            "and": [
                {"<=": [{"var": "annual_income"}, 150000]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)",
        "description": "Contributory pension scheme for unorganized workers (maids, drivers, brick kiln workers, street vendors) with matching government contribution.",
        "category": "Social Welfare",
        "state_applicable": "All",
        "benefits": "Assured monthly pension of ₹3,000 after attaining 60 years of age for monthly contribution of ₹55 to ₹200.",
        "documents_required": "Aadhaar Card, Savings Bank Account / Jan Dhan Account with IFSC, Mobile Number",
        "official_website": "https://maandhan.in",
        "search_tags": "unorganized labor driver maid worker pension 3000 pm-sym maandhan",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 40]},
                {"<=": [{"var": "annual_income"}, 180000]},
                {"in": [{"var": "occupation"}, ["Daily Wage Laborer", "Artisan", "Self-employed", "Farmer"]]}
            ]
        }
    },
    {
        "name": "PM Kisan Maan-dhan Yojana (PM-KMY)",
        "description": "Old age pension scheme exclusively for small and marginal farmers with matching monthly contribution from Central Government.",
        "category": "Agriculture",
        "state_applicable": "All",
        "benefits": "Assured minimum monthly pension of ₹3,000 after attaining the age of 60 years.",
        "documents_required": "Aadhaar Card, Land Record (up to 2 hectares), Bank Passbook",
        "official_website": "https://maandhan.in",
        "search_tags": "farmer pension kisan maandhan old age retirement 3000 monthly",
        "rule": {
            "and": [
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 40]},
                {"<=": [{"var": "land_ownership_acres"}, 5]}
            ]
        }
    },
    {
        "name": "Pradhan Mantri Garib Kalyan Anna Yojana (PMGKAY)",
        "description": "Provides 5 kg of free foodgrains (rice/wheat) per person per month to priority households and 35 kg per family for Antyodaya households.",
        "category": "Social Welfare",
        "state_applicable": "All",
        "benefits": "Free monthly foodgrains (5 kg per person) through Public Distribution System (PDS) ration shops.",
        "documents_required": "Ration Card (NFSA / Antyodaya / Priority Household), Aadhaar Card",
        "official_website": "https://dfpd.gov.in",
        "search_tags": "free ration food rice wheat ration card pds pmgkay bpl poor",
        "rule": {
            "<=": [{"var": "annual_income"}, 200000]
        }
    },
    {
        "name": "Rashtriya Vayoshri Yojana (RVY)",
        "description": "Provides physical aids and assisted-living devices for Senior Citizens belonging to BPL category or monthly income < ₹15,000.",
        "category": "Senior Citizens",
        "state_applicable": "All",
        "benefits": "Free distribution of walking sticks, elbow crutches, walkers, hearing aids, wheelchairs, artificial dentures, and spectacles.",
        "documents_required": "Age Proof (Aadhaar verifying age >= 60), BPL card / Income certificate, Medical assessment certificate",
        "official_website": "https://alimco.in",
        "search_tags": "senior citizen wheelchair spectacles hearing aid walking stick free rvy",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 60]},
                {"<=": [{"var": "annual_income"}, 180000]}
            ]
        }
    },
    {
        "name": "Senior Citizens Savings Scheme (SCSS)",
        "description": "Government-backed retirement savings program providing regular quarterly interest payout and capital security for senior citizens.",
        "category": "Senior Citizens",
        "state_applicable": "All",
        "benefits": "8.2% guaranteed annual interest payable quarterly on deposits up to ₹30 lakh with Section 80C tax benefits.",
        "documents_required": "Aadhaar Card, PAN Card, Age Proof (>=60 years), Retirement superannuation proof (if 55-60 yrs)",
        "official_website": "https://www.indiapost.gov.in",
        "search_tags": "senior citizen savings post office deposit high interest regular income scss",
        "rule": {
            ">=": [{"var": "age"}, 60]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 8. CENTRAL SCHEMES — SKILL DEVELOPMENT & EMPLOYMENT (8 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)",
        "description": "Skill certification and training scheme offering short-term industry-aligned courses, recognition of prior learning, and placement support.",
        "category": "Employment",
        "state_applicable": "All",
        "benefits": "100% free industry training, NSQF recognized certification, ₹8,000 monetary award, and job placement assistance.",
        "documents_required": "Aadhaar Card, Voter ID, Bank Account Passbook, Educational certificates",
        "official_website": "https://www.pmkvyofficial.org",
        "search_tags": "skill training course job free certificate placement pmkvy technical",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 15]},
                {"<=": [{"var": "age"}, 45]}
            ]
        }
    },
    {
        "name": "MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Scheme)",
        "description": "Legal guarantee for at least 100 days of unskilled wage employment in a financial year to every rural household whose adult members volunteer for manual work.",
        "category": "Employment",
        "state_applicable": "All",
        "benefits": "Guaranteed 100 days paid manual work at statutory state daily minimum wage (₹230 - ₹375 per day) deposited to bank account.",
        "documents_required": "Aadhaar Card, MGNREGA Job Card (issued by Gram Panchayat), Bank Passbook",
        "official_website": "https://nrega.nic.in",
        "search_tags": "mgnrega 100 days work job card rural wage manual labor employment",
        "rule": {
            "and": [
                {"==": [{"var": "is_rural"}, True]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)",
        "description": "Demand-driven placement-linked skill training for poor rural youth with guaranteed minimum 70% job placement.",
        "category": "Employment",
        "state_applicable": "All",
        "benefits": "Free residential vocational training, boarding, lodging, uniform, study material, and guaranteed job placement with minimum wage.",
        "documents_required": "BPL Card / MGNREGA Job Card of parent, Aadhaar Card, 10th/12th certificate, Bank account",
        "official_website": "https://ddugky.gov.in",
        "search_tags": "rural youth job placement skill training residential free ddu gky",
        "rule": {
            "and": [
                {"==": [{"var": "is_rural"}, True]},
                {">=": [{"var": "age"}, 15]},
                {"<=": [{"var": "age"}, 35]},
                {"<=": [{"var": "annual_income"}, 200000]}
            ]
        }
    },
    {
        "name": "National Apprenticeship Promotion Scheme (NAPS-2)",
        "description": "Financial stipend support for candidates undergoing on-the-job industrial apprenticeship training with participating companies.",
        "category": "Employment",
        "state_applicable": "All",
        "benefits": "Direct benefit transfer of 25% of stipend (up to ₹1,500/month) directly to apprentice bank account plus industrial certification.",
        "documents_required": "ITI / Diploma / Degree or 10th/12th certificate, Aadhaar Card, Apprenticeship Portal Registration ID",
        "official_website": "https://www.apprenticeshipindia.gov.in",
        "search_tags": "apprentice industrial training stipend naps internship company job",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 35]}
            ]
        }
    },
    {
        "name": "National Career Service (NCS) Portal",
        "description": "Nationwide digital job portal connecting jobseekers, career counsellors, skill providers, and private/government employers.",
        "category": "Employment",
        "state_applicable": "All",
        "benefits": "Free access to thousands of verified private and government job listings, free career counselling, and job fair registrations.",
        "documents_required": "Aadhaar / National ID, Resume, Educational marksheets",
        "official_website": "https://www.ncs.gov.in",
        "search_tags": "job search career portal resume employment vacancies government ncs",
        "rule": {
            ">=": [{"var": "age"}, 18]
        }
    },
    {
        "name": "PM Internship Scheme in Top 500 Companies",
        "description": "12-month internship opportunities in India's top 500 companies with monthly stipend and one-time allowance for youth.",
        "category": "Employment",
        "state_applicable": "All",
        "benefits": "Monthly stipend of ₹5,000 (₹4,500 from government + ₹500 from CSR) plus ₹6,000 one-time incidentals grant.",
        "documents_required": "Graduation / Diploma marksheets, Aadhaar Card, Family Income Declaration (< ₹8L)",
        "official_website": "https://pminternship.mca.gov.in",
        "search_tags": "internship top companies corporate stipend 5000 youth graduate pm internship",
        "rule": {
            "and": [
                {">=": [{"var": "age"}, 21]},
                {"<=": [{"var": "age"}, 24]},
                {"<=": [{"var": "annual_income"}, 800000]},
                {"in": [{"var": "education"}, ["Graduate", "Post Graduate", "Diploma"]]}
            ]
        }
    },
    {
        "name": "Deendayal Antyodaya Yojana - NULM (National Urban Livelihoods Mission)",
        "description": "Reduces poverty of urban poor households by enabling them to access gainful self-employment and skilled wage employment opportunities.",
        "category": "Employment",
        "state_applicable": "All",
        "benefits": "Subsidized loans at 7% interest for individual micro-enterprises up to ₹2 lakh and group enterprises up to ₹10 lakh + free skill training.",
        "documents_required": "Urban BPL / Low Income Certificate, Aadhaar, Bank Details, Business proposal",
        "official_website": "https://nulm.gov.in",
        "search_tags": "urban livelihood skill training micro enterprise self help group loan nulm",
        "rule": {
            "and": [
                {"==": [{"var": "is_rural"}, False]},
                {"<=": [{"var": "annual_income"}, 250000]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Scheme for Economic Empowerment of DNTs (SEED)",
        "description": "Welfare and skill empowerment scheme for De-notified, Nomadic, and Semi-Nomadic Tribal communities.",
        "category": "Social Welfare",
        "state_applicable": "All",
        "benefits": "Free coaching for competitive exams, health insurance under PMJAY, housing assistance, and livelihood skill development.",
        "documents_required": "DNT Community Certificate, Income Certificate (< ₹2.5L), Aadhaar, Bank Passbook",
        "official_website": "https://seed.dosje.gov.in",
        "search_tags": "dnt nomadic tribal community free coaching health insurance seed",
        "rule": {
            "and": [
                {"<=": [{"var": "annual_income"}, 250000]},
                {">=": [{"var": "age"}, 16]}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 9. CENTRAL SCHEMES — DISABILITY WELFARE (5 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "ADIP Scheme (Assistance to Disabled Persons for Purchase/Fitting of Aids and Appliances)",
        "description": "Assists needy persons with disabilities in procuring durable, modern, scientifically manufactured assistive devices.",
        "category": "Disability",
        "state_applicable": "All",
        "benefits": "100% free distribution of motorized tricycles, braille kits, hearing aids, smart canes, laptops with screen readers, and prosthetics.",
        "documents_required": "UDID Card / Disability Certificate (min 40%), Income Certificate (< ₹22,500/month for 100% subsidy), Aadhaar",
        "official_website": "https://adip.depwd.gov.in",
        "search_tags": "wheelchair hearing aid braille kit motorized tricycle handicap adip free",
        "rule": {
            "and": [
                {"==": [{"var": "disability_status"}, True]},
                {"<=": [{"var": "annual_income"}, 360000]}
            ]
        }
    },
    {
        "name": "Unique Disability ID (UDID) Card & Concessions",
        "description": "Universal digital identity card for PwD ensuring seamless access to travel concessions, educational reservations, and welfare subsidies nationwide.",
        "category": "Disability",
        "state_applicable": "All",
        "benefits": "Universal verified digital disability card, up to 75% rail fare concession, state bus travel pass, and 5% reservation in higher education.",
        "documents_required": "Medical Assessment Disability Certificate, Passport photo, Aadhaar Card, Address proof",
        "official_website": "https://www.swavlambancard.gov.in",
        "search_tags": "udid card unique disability travel concession bus pass train fare pwb",
        "rule": {
            "==": [{"var": "disability_status"}, True]
        }
    },
    {
        "name": "National Handicapped Finance and Development Corporation (NHFDC) Loans",
        "description": "Concessional credit schemes to enable differently-abled individuals to start their own enterprise, purchase commercial vehicles, or pursue higher studies.",
        "category": "Disability",
        "state_applicable": "All",
        "benefits": "Soft loans up to ₹25 lakh at 4% to 8% interest rate with long repayment tenure.",
        "documents_required": "Disability Certificate (min 40%), Project Proposal, Aadhaar Card, Bank account",
        "official_website": "https://www.nhfdc.nic.in",
        "search_tags": "handicap business loan concessional interest disabled entrepreneur nhfdc",
        "rule": {
            "and": [
                {"==": [{"var": "disability_status"}, True]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 60]}
            ]
        }
    },
    {
        "name": "Deendayal Disabled Rehabilitation Scheme (DDRS)",
        "description": "Financial assistance to NGOs running special schools, vocational training centers, and early intervention clinics for children with disabilities.",
        "category": "Disability",
        "state_applicable": "All",
        "benefits": "Free education, speech therapy, physiotherapy, and vocational rehabilitation at subsidized partner centers.",
        "documents_required": "Disability Certificate, Parent Income Certificate, Aadhaar",
        "official_website": "https://disabilityaffairs.gov.in",
        "search_tags": "special school rehabilitation therapy speech physiotherapy ddrs disabled child",
        "rule": {
            "==": [{"var": "disability_status"}, True]
        }
    },
    {
        "name": "Scholarships for Students with Disabilities (Pre-Matric / Post-Matric / Top Class)",
        "description": "Comprehensive scholarship scheme covering maintenance fees, book grants, and disability allowances for PwD students from Class 9 to PhD.",
        "category": "Disability",
        "state_applicable": "All",
        "benefits": "Tuition fees + monthly maintenance allowance up to ₹4,000/month + book grant + escort/reader allowance.",
        "documents_required": "Disability Certificate (>40%), Family Income Certificate (< ₹2.5L), Bonafide student certificate, Aadhaar",
        "official_website": "https://scholarships.gov.in",
        "search_tags": "disability scholarship student handicap tuition allowance book grant reader",
        "rule": {
            "and": [
                {"==": [{"var": "disability_status"}, True]},
                {"==": [{"var": "is_student"}, True]},
                {"<=": [{"var": "annual_income"}, 250000]}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 10. STATE SCHEMES — TAMIL NADU (8 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "Kalaignar Magalir Urimai Thittam (KMUT)",
        "description": "Universal basic monthly income entitlement of ₹1,000 for women heads of eligible households in Tamil Nadu.",
        "category": "Women",
        "state_applicable": "Tamil Nadu",
        "benefits": "₹1,000 per month direct bank transfer to woman head of family.",
        "documents_required": "Smart Ration Card (Tamil Nadu), Aadhaar Card, Electricity consumer number, Bank Passbook",
        "official_website": "https://kmut.tn.gov.in",
        "search_tags": "tamil nadu kmut magalir urimai 1000 rupees monthly woman head ration card",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 21]},
                {"<=": [{"var": "annual_income"}, 250000]},
                {"<=": [{"var": "land_ownership_acres"}, 5]}
            ]
        }
    },
    {
        "name": "Pudhumai Penn Scheme (Moovalur Ramamirtham Ammiyar Scheme)",
        "description": "Financial assistance to girl students who studied in Tamil Nadu Government schools (Class 6 to 12) to pursue higher education.",
        "category": "Education",
        "state_applicable": "Tamil Nadu",
        "benefits": "₹1,000 per month direct bank transfer till graduation / diploma completion.",
        "documents_required": "Govt School TC / Bonafide (Class 6-12), College Admission ID, Aadhaar, Bank Passbook",
        "official_website": "https://www.pudhumaipenn.tn.gov.in",
        "search_tags": "tamil nadu pudhumai penn 1000 rupees college girl student government school",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {"==": [{"var": "gender"}, "Female"]},
                {"==": [{"var": "is_student"}, True]},
                {">=": [{"var": "age"}, 17]},
                {"<=": [{"var": "age"}, 25]}
            ]
        }
    },
    {
        "name": "Tamil Pudhalvan Scheme",
        "description": "Financial assistance to boy students who studied in Tamil Nadu Government schools (Class 6 to 12) pursuing higher undergraduate studies.",
        "category": "Education",
        "state_applicable": "Tamil Nadu",
        "benefits": "₹1,000 per month direct bank transfer throughout their higher education degree course.",
        "documents_required": "Government school study certificate (6th to 12th), College ID, Aadhaar, Bank Passbook",
        "official_website": "https://www.tn.gov.in",
        "search_tags": "tamil nadu tamil pudhalvan 1000 rupees boy male student college govt school",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {"==": [{"var": "gender"}, "Male"]},
                {"==": [{"var": "is_student"}, True]},
                {">=": [{"var": "age"}, 17]},
                {"<=": [{"var": "age"}, 25]}
            ]
        }
    },
    {
        "name": "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS - Tamil Nadu)",
        "description": "Comprehensive cashless medical treatment coverage up to ₹5 lakh per family per year across government and private hospitals in Tamil Nadu.",
        "category": "Healthcare",
        "state_applicable": "Tamil Nadu",
        "benefits": "Cashless hospitalization up to ₹5,00,000 per family per year for 1,090 surgical and medical procedures.",
        "documents_required": "Tamil Nadu Smart Ration Card, Income Certificate (< ₹1.2L/year), Aadhaar Card",
        "official_website": "https://www.cmchistn.com",
        "search_tags": "tamil nadu cmchis health insurance 5 lakh hospital surgery medical card",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {"<=": [{"var": "annual_income"}, 120000]}
            ]
        }
    },
    {
        "name": "Moovalur Ramamirtham Ammaiyar Marriage Assistance Scheme (Tamil Nadu)",
        "description": "Marriage assistance to poor parents/brides with educational qualification, providing cash aid and 8 grams 22ct gold coin for Thirumangalyam.",
        "category": "Women",
        "state_applicable": "Tamil Nadu",
        "benefits": "₹25,000 to ₹50,000 cash grant + one 8-gram sovereign gold coin (Thirumangalyam).",
        "documents_required": "Income Certificate (< ₹72,000), 10th / Degree Marksheet, Age proof of bride (>=18 yrs), Marriage invitation",
        "official_website": "https://www.tn.gov.in",
        "search_tags": "tamil nadu marriage assistance thirumangalyam gold coin wedding poor bride",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "annual_income"}, 100000]}
            ]
        }
    },
    {
        "name": "Dr. Muthulakshmi Reddy Maternity Benefit Scheme (Tamil Nadu)",
        "description": "Financial assistance to poor pregnant women in Tamil Nadu to meet nutritional and healthcare needs.",
        "category": "Healthcare",
        "state_applicable": "Tamil Nadu",
        "benefits": "₹18,000 total assistance (₹14,000 in 5 cash installments + 2 Amma Maternity Nutrition Kits worth ₹4,000).",
        "documents_required": "PICME registration number, Tamil Nadu Ration Card, Aadhaar Card, Mother-Child Card",
        "official_website": "https://picme.tn.gov.in",
        "search_tags": "tamil nadu muthulakshmi reddy maternity pregnant nutrition kit 18000 picme",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 19]},
                {"<=": [{"var": "annual_income"}, 150000]}
            ]
        }
    },
    {
        "name": "Tamil Nadu Free Laptop Scheme for Students",
        "description": "Distribution of free laptops to students who passed Class 12 in Tamil Nadu Government and Government-Aided schools.",
        "category": "Education",
        "state_applicable": "Tamil Nadu",
        "benefits": "Free brand new laptop computer with preloaded educational software.",
        "documents_required": "School 12th pass bonafide certificate, Student ID, Aadhaar",
        "official_website": "https://www.elcot.in",
        "search_tags": "tamil nadu free laptop student 12th pass government school computer",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {"==": [{"var": "is_student"}, True]},
                {">=": [{"var": "age"}, 16]},
                {"<=": [{"var": "age"}, 22]}
            ]
        }
    },
    {
        "name": "Unemployed Youth Employment Generation Programme (UYEGP - Tamil Nadu)",
        "description": "Subsidized bank loan scheme to generate self-employment for educated unemployed youth in Tamil Nadu.",
        "category": "MSME",
        "state_applicable": "Tamil Nadu",
        "benefits": "25% government subsidy up to ₹1.25 lakh on project loans up to ₹15 lakh (manufacturing) and ₹5 lakh (service/business).",
        "documents_required": "8th Pass / 10th / 12th / Degree Certificate, Income Certificate (< ₹5L), Community Certificate, Project Proposal",
        "official_website": "https://www.msmeonline.tn.gov.in",
        "search_tags": "tamil nadu uyegp youth business loan subsidy self employed shop startup",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Tamil Nadu"]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 45]},
                {"<=": [{"var": "annual_income"}, 500000]}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 11. STATE SCHEMES — KARNATAKA (6 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "Gruha Lakshmi Scheme (Karnataka)",
        "description": "Financial assistance of ₹2,000 per month to the woman head of every eligible BPL and APL family in Karnataka.",
        "category": "Women",
        "state_applicable": "Karnataka",
        "benefits": "₹2,000 monthly direct bank transfer to woman head of the family.",
        "documents_required": "Karnataka Ration Card (BPL/APL/AAY), Aadhaar Card of woman and husband, Bank Passbook",
        "official_website": "https://sevasindhugs.karnataka.gov.in",
        "search_tags": "karnataka gruha lakshmi 2000 rupees monthly woman head sevasindhu",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Karnataka"]},
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Gruha Jyothi Scheme (Karnataka)",
        "description": "Free electricity up to 200 units per month for domestic consumers in Karnataka.",
        "category": "Housing",
        "state_applicable": "Karnataka",
        "benefits": "Zero electricity bill for monthly consumption up to average usage + 10% (capped at 200 units).",
        "documents_required": "Aadhaar Card, Karnataka Electricity Connection Account ID / RR Number",
        "official_website": "https://sevasindhugs.karnataka.gov.in",
        "search_tags": "karnataka gruha jyothi 200 units free electricity power bill zero bill",
        "rule": {
            "==": [{"var": "state"}, "Karnataka"]
        }
    },
    {
        "name": "Yuva Nidhi Scheme (Karnataka)",
        "description": "Monthly unemployment allowance for educated unemployed graduates and diploma holders in Karnataka for up to 2 years.",
        "category": "Employment",
        "state_applicable": "Karnataka",
        "benefits": "₹3,000 per month for unemployed degree graduates; ₹1,500 per month for diploma holders.",
        "documents_required": "Karnataka Degree/Diploma Certificate, Aadhaar Card, Domicile certificate, Bank passbook",
        "official_website": "https://sevasindhugs.karnataka.gov.in",
        "search_tags": "karnataka yuva nidhi unemployed stipend 3000 graduate diploma allowance",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Karnataka"]},
                {"in": [{"var": "education"}, ["Graduate", "Post Graduate", "Diploma"]]},
                {"in": [{"var": "employment_status"}, ["Unemployed"]]},
                {">=": [{"var": "age"}, 21]},
                {"<=": [{"var": "age"}, 30]}
            ]
        }
    },
    {
        "name": "Shakti Scheme (Karnataka Free Bus Travel for Women)",
        "description": "Free bus travel for all women and transgender residents of Karnataka in ordinary KSRTC, BMTC, NWKRTC, and NEKRTC state buses.",
        "category": "Women",
        "state_applicable": "Karnataka",
        "benefits": "100% free bus travel across Karnataka state road transport buses.",
        "documents_required": "Karnataka Domicile / Address Proof (Aadhaar or Shakti Smart Card)",
        "official_website": "https://ksrtc.in",
        "search_tags": "karnataka shakti free bus travel woman transport kstrc bmtc pass",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Karnataka"]},
                {"in": [{"var": "gender"}, ["Female", "Other"]]}
            ]
        }
    },
    {
        "name": "Anna Bhagya Scheme (Karnataka)",
        "description": "Provides 10 kg of foodgrains (or direct cash equivalent for 5 kg at ₹170/person/month) to all BPL and Antyodaya cardholders.",
        "category": "Social Welfare",
        "state_applicable": "Karnataka",
        "benefits": "5 kg free rice + ₹170 per person/month DBT in lieu of additional 5 kg rice.",
        "documents_required": "Karnataka BPL / Antyodaya Ration Card, Aadhaar linked to Bank Account",
        "official_website": "https://ahara.kar.nic.in",
        "search_tags": "karnataka anna bhagya free rice dbt 170 rupees ration card bpl",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Karnataka"]},
                {"<=": [{"var": "annual_income"}, 150000]}
            ]
        }
    },
    {
        "name": "Ganga Kalyana Scheme (Karnataka)",
        "description": "Free drilling of irrigation borewells, pump installation, and pipeline electrification for small and marginal farmers belonging to SC/ST/OBC/Minority categories.",
        "category": "Agriculture",
        "state_applicable": "Karnataka",
        "benefits": "100% free borewell drilling, submersible pump, and power connection worth up to ₹4 lakh per borewell.",
        "documents_required": "Caste Certificate, Land RTC records (1 to 5 acres), Income Certificate, Aadhaar",
        "official_website": "https://kmdc.karnataka.gov.in",
        "search_tags": "karnataka ganga kalyana free borewell pump irrigation sc st obc farmer",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Karnataka"]},
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">": [{"var": "land_ownership_acres"}, 0]},
                {"<=": [{"var": "land_ownership_acres"}, 5]},
                {"in": [{"var": "category"}, ["SC", "ST", "OBC"]]}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 12. STATE SCHEMES — MAHARASHTRA (6 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "Mukhyamantri Majhi Ladki Bahin Yojana (Maharashtra)",
        "description": "Direct financial assistance of ₹1,500 per month to eligible women aged 21 to 65 years residing in Maharashtra.",
        "category": "Women",
        "state_applicable": "Maharashtra",
        "benefits": "₹1,500 per month direct bank transfer (₹18,000/year) to woman's bank account.",
        "documents_required": "Maharashtra Domicile Certificate / Orange or Yellow Ration Card, Aadhaar Card, Bank Passbook, Hamipatra (Self-declaration)",
        "official_website": "https://ladakibahin.maharashtra.gov.in",
        "search_tags": "maharashtra ladki bahin 1500 monthly dbt woman cash assistance yojana",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Maharashtra"]},
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 21]},
                {"<=": [{"var": "age"}, 65]},
                {"<=": [{"var": "annual_income"}, 250000]}
            ]
        }
    },
    {
        "name": "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY - Maharashtra)",
        "description": "Comprehensive cashless health insurance providing coverage up to ₹5 lakh per family per year to all ration card holders in Maharashtra.",
        "category": "Healthcare",
        "state_applicable": "Maharashtra",
        "benefits": "Cashless treatment and surgery up to ₹5,00,000 per family per year in empanelled public and private hospitals.",
        "documents_required": "Ration Card (Yellow/Orange/White), Aadhaar Card, Voter ID",
        "official_website": "https://www.jeevandayee.gov.in",
        "search_tags": "maharashtra mjpjay health insurance 5 lakh hospital surgery medical card",
        "rule": {
            "==": [{"var": "state"}, "Maharashtra"]
        }
    },
    {
        "name": "Sanjay Gandhi Niradhar Anudan Yojana (Maharashtra)",
        "description": "Monthly financial pension for destitute elderly, disabled, widows, and chronically ill persons in Maharashtra.",
        "category": "Social Welfare",
        "state_applicable": "Maharashtra",
        "benefits": "₹1,500 per month for single beneficiary; ₹2,000 per month if there are two or more beneficiaries in the family.",
        "documents_required": "Income Certificate (< ₹21,000/yr / BPL), Maharashtra Domicile, Age / Disability / Widow proof, Aadhaar",
        "official_website": "https://sjsa.maharashtra.gov.in",
        "search_tags": "maharashtra sanjay gandhi niradhar pension destitute widow disabled 1500",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Maharashtra"]},
                {"<=": [{"var": "annual_income"}, 100000]}
            ]
        }
    },
    {
        "name": "Namo Shetkari Mahasanman Nidhi Yojana (Maharashtra)",
        "description": "Direct financial aid of ₹6,000 per year by Maharashtra government to farmers, in addition to PM-KISAN (total ₹12,000/year).",
        "category": "Agriculture",
        "state_applicable": "Maharashtra",
        "benefits": "₹6,000 per year in 3 equal installments of ₹2,000 each (direct bank transfer).",
        "documents_required": "PM-KISAN registration, Aadhaar Card, 7/12 Land Utara, Bank Passbook",
        "official_website": "https://krishi.maharashtra.gov.in",
        "search_tags": "maharashtra namo shetkari kisan farmer 6000 additional income 7/12",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Maharashtra"]},
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">": [{"var": "land_ownership_acres"}, 0]}
            ]
        }
    },
    {
        "name": "Mukhyamantri Vayoshri Yojana (Maharashtra)",
        "description": "One-time financial assistance of ₹3,000 directly deposited to senior citizens aged 65 and above for purchase of assistive devices.",
        "category": "Senior Citizens",
        "state_applicable": "Maharashtra",
        "benefits": "One-time direct bank transfer of ₹3,000 for health and physical support aids.",
        "documents_required": "Aadhaar Card, Age Proof (>=65 yrs), Maharashtra Domicile, Income Certificate (< ₹2L), Bank Passbook",
        "official_website": "https://sjsa.maharashtra.gov.in",
        "search_tags": "maharashtra vayoshri senior citizen 3000 cash grant 65 years old age",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Maharashtra"]},
                {">=": [{"var": "age"}, 65]},
                {"<=": [{"var": "annual_income"}, 200000]}
            ]
        }
    },
    {
        "name": "Annasaheb Patil Arthik Vikas Mahamandal Loan Scheme (Maharashtra)",
        "description": "Interest-free business and startup loans for unemployed youth from economically weaker sections in Maharashtra.",
        "category": "MSME",
        "state_applicable": "Maharashtra",
        "benefits": "Interest reimbursement up to 12% on bank project loans up to ₹15 lakh (effective zero interest).",
        "documents_required": "Aadhaar Card, Maharashtra Domicile, 10th pass / Degree, Project DPR, Bank Loan Sanction Letter",
        "official_website": "https://mahaswayam.gov.in",
        "search_tags": "maharashtra annasaheb patil loan interest free business 15 lakh self employed",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Maharashtra"]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 45]}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 13. STATE SCHEMES — UTTAR PRADESH (6 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "UP Mukhyamantri Kanya Sumangala Yojana",
        "description": "Conditional cash transfer of ₹25,000 in 6 installments to girls in Uttar Pradesh from birth up to admission in degree/diploma courses.",
        "category": "Women",
        "state_applicable": "Uttar Pradesh",
        "benefits": "₹25,000 total financial assistance paid in 6 phased educational and health milestones.",
        "documents_required": "Girl Child Birth Certificate, UP Domicile, Income Certificate (< ₹3L), Vaccination card, School Admission proof",
        "official_website": "https://mksy.up.gov.in",
        "search_tags": "uttar pradesh kanya sumangala girl child cash 25000 education birth",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Uttar Pradesh"]},
                {"<=": [{"var": "annual_income"}, 300000]}
            ]
        }
    },
    {
        "name": "UP Mukhyamantri Abhyudaya Yojana (Free IAS/NEET/JEE Coaching)",
        "description": "Free physical and online expert coaching, tablet assistance, and study materials for civil services, NEET, JEE, and NDA exams.",
        "category": "Education",
        "state_applicable": "Uttar Pradesh",
        "benefits": "Free competitive exam coaching by IAS/IPS officers and subject experts + free digital tablet grant for top scorers.",
        "documents_required": "UP Domicile, 12th/Graduation marksheet, Aadhaar, Entrance exam registration",
        "official_website": "https://abhyuday.up.gov.in",
        "search_tags": "uttar pradesh abhyudaya free coaching ias upsc neet jee tablet student",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Uttar Pradesh"]},
                {"==": [{"var": "is_student"}, True]},
                {">=": [{"var": "age"}, 17]},
                {"<=": [{"var": "age"}, 30]}
            ]
        }
    },
    {
        "name": "UP Swami Vivekanand Yuva Sashaktikaran Yojana (Free Smartphone/Tablet)",
        "description": "Free distribution of smartphones and tablets to youth enrolled in undergraduate, postgraduate, diploma, and skill courses in UP.",
        "category": "Education",
        "state_applicable": "Uttar Pradesh",
        "benefits": "Free 5G/4G smartphone or tablet preloaded with study materials and employment portals.",
        "documents_required": "College ID / DigiShakti student enrollment, Aadhaar Card, UP Domicile",
        "official_website": "https://digishakti.up.gov.in",
        "search_tags": "uttar pradesh free smartphone tablet digishakti student college youth",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Uttar Pradesh"]},
                {"==": [{"var": "is_student"}, True]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 26]}
            ]
        }
    },
    {
        "name": "UP Mukhyamantri Krishak Durghatna Kalyan Yojana",
        "description": "Financial compensation of up to ₹5 lakh to farmer families in UP in the event of accidental death or permanent disability while farming.",
        "category": "Agriculture",
        "state_applicable": "Uttar Pradesh",
        "benefits": "₹5,00,000 lump sum compensation on death / full disability; ₹2,50,000 on partial disability.",
        "documents_required": "Post-mortem / Disability Report, Land Khatauni, FIR copy, Aadhaar, Legal heir certificate",
        "official_website": "https://upagripardarshi.gov.in",
        "search_tags": "uttar pradesh farmer accident death 5 lakh compensation kisan durghatna",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Uttar Pradesh"]},
                {"==": [{"var": "occupation"}, "Farmer"]}
            ]
        }
    },
    {
        "name": "UP Old Age / Vridhavastha Pension Scheme",
        "description": "Monthly pension of ₹1,000 for elderly citizens aged 60 and above living below poverty line in Uttar Pradesh.",
        "category": "Senior Citizens",
        "state_applicable": "Uttar Pradesh",
        "benefits": "₹1,000 per month (₹3,000 quarterly) direct bank transfer to senior citizen's account.",
        "documents_required": "Age proof (Aadhaar >= 60 yrs), Income Certificate (Rural < ₹46,080 / Urban < ₹56,460), Bank Passbook",
        "official_website": "https://sspy-up.gov.in",
        "search_tags": "uttar pradesh old age pension vridhavastha 1000 monthly sspy senior",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Uttar Pradesh"]},
                {">=": [{"var": "age"}, 60]},
                {"<=": [{"var": "annual_income"}, 100000]}
            ]
        }
    },
    {
        "name": "UP One District One Product (ODOP) Margin Money Scheme",
        "description": "Financial assistance and margin money subsidy to promote traditional artisanal and indigenous products in all 75 districts of UP.",
        "category": "MSME",
        "state_applicable": "Uttar Pradesh",
        "benefits": "Margin money subsidy up to 25% (up to ₹20 lakh) on business project loans for designated district crafts.",
        "documents_required": "Aadhaar Card, UP Domicile, Project DPR, ODOP trade certificate, Bank application",
        "official_website": "https://odopup.in",
        "search_tags": "uttar pradesh odop craft artisan business loan subsidy handicraft",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Uttar Pradesh"]},
                {">=": [{"var": "age"}, 18]},
                {"==": [{"var": "occupation"}, "Self-employed"]}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 14. STATE SCHEMES — KERALA (5 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "Kerala Karunya Arogya Suraksha Padhathi (KASP)",
        "description": "Comprehensive health protection scheme offering ₹5 lakh cashless medical care per family per year in Kerala.",
        "category": "Healthcare",
        "state_applicable": "Kerala",
        "benefits": "₹5,00,000 cashless secondary and tertiary hospital treatment per family per year.",
        "documents_required": "Kerala Ration Card, Aadhaar Card, KASP Health Card",
        "official_website": "https://sha.kerala.gov.in",
        "search_tags": "kerala karunya kasp health insurance 5 lakh hospital cashless treatment",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Kerala"]},
                {"<=": [{"var": "annual_income"}, 300000]}
            ]
        }
    },
    {
        "name": "Kerala Social Security Welfare Pension (Old Age / Widow / Disability)",
        "description": "Monthly welfare pension of ₹1,600 to disadvantaged elderly, widows, unmarried women above 50, and disabled persons in Kerala.",
        "category": "Social Welfare",
        "state_applicable": "Kerala",
        "benefits": "₹1,600 per month deposited directly to bank account or delivered through Primary Co-operative banks.",
        "documents_required": "Kerala Ration card, Income Certificate (< ₹1L), Aadhaar, Age/Disability/Widow Proof",
        "official_website": "https://welfarepension.lsgkerala.gov.in",
        "search_tags": "kerala welfare pension 1600 monthly old age widow disability mustering",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Kerala"]},
                {"<=": [{"var": "annual_income"}, 100000]}
            ]
        }
    },
    {
        "name": "Kudumbashree Micro-Finance & Livelihood Loans (Kerala)",
        "description": "Subsidized linkage loans and interest-subvention for women neighborhood groups (NHGs) for micro-enterprises and farming in Kerala.",
        "category": "Women",
        "state_applicable": "Kerala",
        "benefits": "Low-interest loans at 4% to 7% for micro-enterprises, poultry, organic farming, and catering units.",
        "documents_required": "Kudumbashree NHG Membership Passbook, Aadhaar, Kerala Domicile",
        "official_website": "https://www.kudumbashree.org",
        "search_tags": "kerala kudumbashree women self help group micro finance low interest loan",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Kerala"]},
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Kerala Ayyankali Urban Employment Guarantee Scheme (AUEGS)",
        "description": "Guarantees at least 100 days of unskilled wage employment in a year to adult members of urban households in Kerala.",
        "category": "Employment",
        "state_applicable": "Kerala",
        "benefits": "100 days paid employment at state urban minimum wage rates.",
        "documents_required": "Kerala Urban Local Body resident proof, Job Card, Aadhaar",
        "official_website": "https://urbanemployment.kerala.gov.in",
        "search_tags": "kerala ayyankali urban employment 100 days work municipal wage job card",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Kerala"]},
                {"==": [{"var": "is_rural"}, False]},
                {">=": [{"var": "age"}, 18]}
            ]
        }
    },
    {
        "name": "Subhiksha Keralam Scheme (Agriculture & Animal Husbandry)",
        "description": "Subsidy support to cultivate fallow land, expand dairy and poultry, and install precision farming polyhouses in Kerala.",
        "category": "Agriculture",
        "state_applicable": "Kerala",
        "benefits": "Up to 50% subsidy on seed inputs, greenhouse construction, and drip irrigation systems.",
        "documents_required": "Aadhaar Card, Land tax receipt, Krishi Bhavan registration",
        "official_website": "https://aims.kerala.gov.in",
        "search_tags": "kerala subhiksha farm fallow land dairy polyhouse subsidy krishi bhavan",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Kerala"]},
                {">": [{"var": "land_ownership_acres"}, 0]}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 15. STATE SCHEMES — TELANGANA & ANDHRA PRADESH (8 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "Rythu Bharosa / Rythu Bandhu (Telangana)",
        "description": "Investment support scheme of ₹15,000 per acre per year for agriculture and horticulture crops to farmer landholders in Telangana.",
        "category": "Agriculture",
        "state_applicable": "Telangana",
        "benefits": "₹15,000 per acre per year (₹7,500 per season) direct bank transfer for seeds, fertilizers, and inputs.",
        "documents_required": "Pattadar Passbook (Dharani), Aadhaar Card, Bank Account linked to Aadhaar",
        "official_website": "https://dharani.telangana.gov.in",
        "search_tags": "telangana rythu bharosa bandhu 15000 acre farmer input dbt dharani",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Telangana"]},
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">": [{"var": "land_ownership_acres"}, 0]}
            ]
        }
    },
    {
        "name": "Mahalakshmi Scheme (Telangana Free Bus & ₹2,500 Cash Support)",
        "description": "Free bus travel for women in TSRTC buses and ₹2,500 monthly financial assistance to eligible poor women in Telangana.",
        "category": "Women",
        "state_applicable": "Telangana",
        "benefits": "100% free bus travel across Telangana + ₹2,500 per month financial aid for women head of family.",
        "documents_required": "Telangana White Ration Card / Food Security Card, Aadhaar Card, Bank Passbook",
        "official_website": "https://prajavaani.telangana.gov.in",
        "search_tags": "telangana mahalakshmi 2500 monthly free bus travel woman tsrtc",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Telangana"]},
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "annual_income"}, 200000]}
            ]
        }
    },
    {
        "name": "Aasara Pension Scheme (Telangana)",
        "description": "Monthly social security pension of ₹2,016 for elderly, widows, weavers, toddy tappers, and ₹4,016 for disabled persons in Telangana.",
        "category": "Social Welfare",
        "state_applicable": "Telangana",
        "benefits": "₹2,016 to ₹4,016 monthly pension deposited directly to beneficiary bank/post office account.",
        "documents_required": "Food Security Card (White Ration Card), Aadhaar Card, Age/Widow/Disability Proof",
        "official_website": "https://aasara.telangana.gov.in",
        "search_tags": "telangana aasara pension 2016 4016 monthly old age widow disabled",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Telangana"]},
                {"<=": [{"var": "annual_income"}, 150000]}
            ]
        }
    },
    {
        "name": "Gruha Jyothi Scheme (Telangana 200 Units Free Power)",
        "description": "Provides up to 200 units of free household electricity every month to all poor domestic consumers in Telangana.",
        "category": "Housing",
        "state_applicable": "Telangana",
        "benefits": "Zero electricity bill for households consuming under 200 units per month.",
        "documents_required": "White Ration Card, Domestic Electricity Consumer Number (USCNO), Aadhaar",
        "official_website": "https://tgsouthernpower.org",
        "search_tags": "telangana gruha jyothi 200 units free power electricity zero bill",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Telangana"]},
                {"<=": [{"var": "annual_income"}, 200000]}
            ]
        }
    },
    {
        "name": "YSR / AP Rythu Bharosa (Andhra Pradesh)",
        "description": "Financial assistance of ₹20,000 per year to farmer families including tenant farmers and RoFR forest land cultivators in Andhra Pradesh.",
        "category": "Agriculture",
        "state_applicable": "Andhra Pradesh",
        "benefits": "₹20,000 per year per farmer family in three seasonal installments.",
        "documents_required": "Pattadar Passbook / CCRC Tenant Farmer Card, Aadhaar Card, Bank Account",
        "official_website": "https://ysrrythubharosa.ap.gov.in",
        "search_tags": "andhra pradesh rythu bharosa 20000 farmer crop investment tenant dbt",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Andhra Pradesh"]},
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">": [{"var": "land_ownership_acres"}, 0]}
            ]
        }
    },
    {
        "name": "NTR Bharosa Pension Scheme (Andhra Pradesh)",
        "description": "Monthly pension of ₹4,000 for senior citizens, widows, single women, weavers, and up to ₹6,000 - ₹15,000 for disabled/dialysis patients in AP.",
        "category": "Social Welfare",
        "state_applicable": "Andhra Pradesh",
        "benefits": "₹4,000 to ₹15,000 monthly pension delivered directly at doorsteps on the 1st of every month.",
        "documents_required": "Rice Card (AP), Aadhaar Card, Age / Medical Disability Certificate",
        "official_website": "https://sspensions.ap.gov.in",
        "search_tags": "andhra pradesh ntr bharosa pension 4000 monthly old age widow door delivery",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Andhra Pradesh"]},
                {"<=": [{"var": "annual_income"}, 150000]}
            ]
        }
    },
    {
        "name": "Thalliki Vandanam Scheme (Andhra Pradesh)",
        "description": "Annual financial aid of ₹15,000 to mothers for sending each school-going child to accredited schools in Andhra Pradesh.",
        "category": "Education",
        "state_applicable": "Andhra Pradesh",
        "benefits": "₹15,000 per school-going child per year direct bank transfer to mother's account.",
        "documents_required": "Child School Admission / Student ID, Mother Aadhaar & Bank Passbook, Rice Card",
        "official_website": "https://jaganannaammavodi.ap.gov.in",
        "search_tags": "andhra pradesh thalliki vandanam amma vodi 15000 school student mother cash",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Andhra Pradesh"]},
                {"<=": [{"var": "annual_income"}, 200000]}
            ]
        }
    },
    {
        "name": "Dr. YSR Aarogyasri Scheme (Andhra Pradesh)",
        "description": "Universal cashless healthcare scheme covering up to ₹25 lakh for 3,257 treatments and surgeries in AP and Hyderabad/Chennai network hospitals.",
        "category": "Healthcare",
        "state_applicable": "Andhra Pradesh",
        "benefits": "Cashless hospitalization coverage up to ₹25,00,000 per family per year.",
        "documents_required": "Aarogyasri Health Card / AP Rice Card, Aadhaar Card",
        "official_website": "https://aarogyasri.ap.gov.in",
        "search_tags": "andhra pradesh aarogyasri health insurance 25 lakh hospital free surgery",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Andhra Pradesh"]},
                {"<=": [{"var": "annual_income"}, 500000]}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 16. STATE SCHEMES — RAJASTHAN & GUJARAT (6 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "Mukhyamantri Ayushman Arogya Yojana (MAAY - Rajasthan)",
        "description": "Cashless health assurance up to ₹25 lakh per family per year covering IPD, OPD medicines, and diagnostics across Rajasthan.",
        "category": "Healthcare",
        "state_applicable": "Rajasthan",
        "benefits": "₹25,00,000 annual cashless hospitalization per family across government and private empanelled hospitals.",
        "documents_required": "Jan Aadhaar Card (Rajasthan), Aadhaar Card",
        "official_website": "https://health.rajasthan.gov.in",
        "search_tags": "rajasthan ayushman chiranjeevi 25 lakh health insurance hospital jan aadhaar",
        "rule": {
            "==": [{"var": "state"}, "Rajasthan"]
        }
    },
    {
        "name": "Rajasthan Social Security Pension (Vridhajan / Ekal Nari)",
        "description": "Monthly pension of minimum ₹1,150 (with automatic 15% annual increase) to elderly citizens and single/widowed women in Rajasthan.",
        "category": "Senior Citizens",
        "state_applicable": "Rajasthan",
        "benefits": "Minimum ₹1,150 per month direct bank transfer with guaranteed annual inflation indexation.",
        "documents_required": "Jan Aadhaar Card, Income Certificate (< ₹48,000/yr), Age/Widow Proof",
        "official_website": "https://ssp.rajasthan.gov.in",
        "search_tags": "rajasthan pension 1150 monthly vridhajan old age widow ekal nari",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Rajasthan"]},
                {"<=": [{"var": "annual_income"}, 100000]}
            ]
        }
    },
    {
        "name": "Mukhyamantri Anuprati Coaching Yojana (Rajasthan)",
        "description": "100% free professional coaching for competitive exams (UPSC, RPSC, REET, NEET, JEE, CLAT) for meritorious underprivileged students in Rajasthan.",
        "category": "Education",
        "state_applicable": "Rajasthan",
        "benefits": "Full coaching fees paid directly to top coaching institutes + ₹40,000/year living allowance for students living away from home.",
        "documents_required": "Jan Aadhaar Card, 10th/12th/Graduation Marksheet, Caste & Income Certificate (< ₹8L)",
        "official_website": "https://sje.rajasthan.gov.in",
        "search_tags": "rajasthan anuprati free coaching neet jee ias rpsc clat student scholarship",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Rajasthan"]},
                {"==": [{"var": "is_student"}, True]},
                {"<=": [{"var": "annual_income"}, 800000]},
                {">=": [{"var": "age"}, 16]},
                {"<=": [{"var": "age"}, 30]}
            ]
        }
    },
    {
        "name": "Mukhyamantri Kisan Sahay Yojana (Gujarat)",
        "description": "Crop compensation scheme providing direct financial relief to farmers suffering crop losses due to drought, excess rain, or unseasonal rainfall in Gujarat.",
        "category": "Agriculture",
        "state_applicable": "Gujarat",
        "benefits": "₹20,000 to ₹25,000 per hectare compensation for crop damage exceeding 33% (up to 4 hectares).",
        "documents_required": "Gujarat 8-A / 7-12 Land Record, Aadhaar Card, Bank Passbook, Sowing proof",
        "official_website": "https://ikhedut.gujarat.gov.in",
        "search_tags": "gujarat kisan sahay crop loss damage drought rain compensation ikhedut",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Gujarat"]},
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">": [{"var": "land_ownership_acres"}, 0]}
            ]
        }
    },
    {
        "name": "Mukhyamantri Mahila Utkarsh Yojana (MMUY - Gujarat)",
        "description": "Interest-free loans of ₹1,00,000 to Joint Liability and Earning Groups (JLEG) of women for starting micro-enterprises in Gujarat.",
        "category": "Women",
        "state_applicable": "Gujarat",
        "benefits": "₹1,00,000 collateral-free and 100% interest-free loan per 10-women group (interest borne by state government).",
        "documents_required": "Gujarat Domicile, BPL / Low Income Certificate, Aadhaar, Bank Details",
        "official_website": "https://gujaratindia.gov.in",
        "search_tags": "gujarat mahila utkarsh interest free loan 1 lakh women self help group",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Gujarat"]},
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 59]}
            ]
        }
    },
    {
        "name": "Namo Lakshmi Scheme (Gujarat)",
        "description": "Financial scholarship of ₹50,000 over 4 years to girl students studying in Classes 9 to 12 in Gujarat schools.",
        "category": "Education",
        "state_applicable": "Gujarat",
        "benefits": "₹10,00/yr for Class 9-10 and ₹15,000/yr for Class 11-12 transferred directly to girl's or mother's bank account.",
        "documents_required": "School Admission Bonafide, Family Income Certificate (< ₹6L), Gujarat Domicile, Aadhaar",
        "official_website": "https://scholarships.gujarat.gov.in",
        "search_tags": "gujarat namo lakshmi scholarship 50000 girl student high school class 9 12",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Gujarat"]},
                {"==": [{"var": "gender"}, "Female"]},
                {"==": [{"var": "is_student"}, True]},
                {">=": [{"var": "age"}, 13]},
                {"<=": [{"var": "age"}, 19]},
                {"<=": [{"var": "annual_income"}, 600000]}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 17. STATE SCHEMES — WEST BENGAL, BIHAR & ODISHA (6 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "Kanyashree Prakalpa (West Bengal)",
        "description": "World-renowned conditional cash transfer scheme providing annual scholarships and a one-time grant of ₹25,000 to unmarried girls in West Bengal.",
        "category": "Education",
        "state_applicable": "West Bengal",
        "benefits": "Annual scholarship of ₹1,000 (K1) for classes 8-12 + one-time grant of ₹25,000 (K2) at age 18 upon continuing education unmarried.",
        "documents_required": "West Bengal Resident Proof, Unmarried declaration, School/College ID, Aadhaar, Bank passbook",
        "official_website": "https://wbkanyashree.gov.in",
        "search_tags": "west bengal kanyashree girl student 25000 scholarship unmarried college",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "West Bengal"]},
                {"==": [{"var": "gender"}, "Female"]},
                {"==": [{"var": "is_student"}, True]},
                {">=": [{"var": "age"}, 13]},
                {"<=": [{"var": "age"}, 22]}
            ]
        }
    },
    {
        "name": "Lakshmir Bhandar Scheme (West Bengal)",
        "description": "Monthly basic income support of ₹1,000 for General category and ₹1,200 for SC/ST women aged 25 to 60 in West Bengal.",
        "category": "Women",
        "state_applicable": "West Bengal",
        "benefits": "₹1,000/month (General) or ₹1,200/month (SC/ST) direct bank transfer to woman head of family.",
        "documents_required": "Swasthyasathi Card number, Aadhaar Card, SC/ST Certificate (if applicable), Bank Passbook",
        "official_website": "https://wb.gov.in",
        "search_tags": "west bengal lakshmir bhandar 1000 1200 monthly cash woman swasthyasathi",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "West Bengal"]},
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 25]},
                {"<=": [{"var": "age"}, 60]}
            ]
        }
    },
    {
        "name": "Krishak Bandhu Scheme (West Bengal)",
        "description": "Guaranteed crop input support of up to ₹10,000 per year per acre plus ₹2 lakh accidental death insurance for farmers in West Bengal.",
        "category": "Agriculture",
        "state_applicable": "West Bengal",
        "benefits": "₹10,000/year (minimum ₹4,000) input support in two seasonal installments + ₹2,00,000 life/accidental insurance cover.",
        "documents_required": "RoR / Land Record (Khatian), Voter ID, Aadhaar Card, Bank Passbook",
        "official_website": "https://krishakbandhu.wb.gov.in",
        "search_tags": "west bengal krishak bandhu 10000 farmer crop assistance insurance 2 lakh",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "West Bengal"]},
                {"==": [{"var": "occupation"}, "Farmer"]},
                {">": [{"var": "land_ownership_acres"}, 0]}
            ]
        }
    },
    {
        "name": "Mukhyamantri Kanya Utthan Yojana (Bihar)",
        "description": "Financial assistance of ₹50,000 to every girl graduate and ₹25,000 on passing 12th (unmarried) in Bihar.",
        "category": "Education",
        "state_applicable": "Bihar",
        "benefits": "₹50,000 lump sum direct bank transfer on completing Graduation; ₹25,000 on passing Intermediate (12th).",
        "documents_required": "Degree / 12th Marksheet, Bihar Domicile Certificate, Aadhaar Card, Bank Passbook in student name",
        "official_website": "https://medhasoft.bih.nic.in",
        "search_tags": "bihar kanya utthan 50000 graduate girl student scholarship intermediate",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Bihar"]},
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 17]},
                {"<=": [{"var": "age"}, 28]},
                {"in": [{"var": "education"}, ["12th Pass", "Graduate", "Post Graduate"]]}
            ]
        }
    },
    {
        "name": "Mukhyamantri Udyami Yojana (Bihar)",
        "description": "Financial assistance of ₹10 lakh (₹5 lakh grant + ₹5 lakh interest-free loan) for youth, women, SC/ST/EBC to establish new industries in Bihar.",
        "category": "MSME",
        "state_applicable": "Bihar",
        "benefits": "50% grant (up to ₹5 lakh free) + 50% interest-free loan (1% for general youth) with 7-year repayment tenure.",
        "documents_required": "10+2 / ITI / Diploma / Degree Certificate, Bihar Domicile, Caste Certificate, Project Proposal, PAN",
        "official_website": "https://udyami.bihar.gov.in",
        "search_tags": "bihar udyami 10 lakh loan 5 lakh subsidy industry business enterprise startup",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Bihar"]},
                {">=": [{"var": "age"}, 18]},
                {"<=": [{"var": "age"}, 50]}
            ]
        }
    },
    {
        "name": "Subhadra Yojana (Odisha)",
        "description": "Flagship financial empowerment scheme providing ₹50,000 over 5 years (₹10,000/year in 2 installments) to eligible women in Odisha.",
        "category": "Women",
        "state_applicable": "Odisha",
        "benefits": "₹10,000 per year (₹5,000 on Rakhi Purnima and ₹5,000 on International Women's Day) directly into Aadhaar-linked bank accounts.",
        "documents_required": "Odisha Domicile / Ration Card, Aadhaar Card, Bank Passbook linked with Aadhaar",
        "official_website": "https://subhadra.odisha.gov.in",
        "search_tags": "odisha subhadra 10000 yearly 50000 women cash empowerment dbt",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Odisha"]},
                {"==": [{"var": "gender"}, "Female"]},
                {">=": [{"var": "age"}, 21]},
                {"<=": [{"var": "age"}, 60]}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════════════════════
    # 18. STATE SCHEMES — DELHI & PUNJAB (5 Schemes)
    # ══════════════════════════════════════════════════════════════════════════════
    {
        "name": "Delhi Free Lifeline Electricity & Water Scheme",
        "description": "Zero electricity bill for consumption up to 200 units/month and 20,000 liters of free lifeline drinking water per month in Delhi.",
        "category": "Housing",
        "state_applicable": "Delhi",
        "benefits": "100% subsidy on electricity bills up to 200 units/month + 20,000 liters free monthly piped water.",
        "documents_required": "Delhi Domestic Electricity Connection CA Number, Delhi Jal Board K Number, Aadhaar",
        "official_website": "https://delhi.gov.in",
        "search_tags": "delhi free electricity 200 units water 20000 liters zero bill subsidy",
        "rule": {
            "==": [{"var": "state"}, "Delhi"]
        }
    },
    {
        "name": "Delhi Pink Bus Pass (Free Bus Travel for Women)",
        "description": "Free single journey bus tickets for women passengers travelling on all DTC and Cluster (DIMTS) public buses in Delhi.",
        "category": "Women",
        "state_applicable": "Delhi",
        "benefits": "100% free daily bus travel across all non-AC and AC Delhi Transport Corporation buses.",
        "documents_required": "No prior registration required; pink tickets issued on-board by bus conductor",
        "official_website": "https://dtc.delhi.gov.in",
        "search_tags": "delhi pink ticket free bus pass woman travel dtc transport public bus",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Delhi"]},
                {"==": [{"var": "gender"}, "Female"]}
            ]
        }
    },
    {
        "name": "Delhi Jai Bhim Mukhyamantri Pratibha Vikas Yojana",
        "description": "Free coaching for competitive exams (UPSC, SSC, Banking, Railways, JEE, NEET) along with monthly stipend for SC/ST/OBC/EWS students in Delhi.",
        "category": "Education",
        "state_applicable": "Delhi",
        "benefits": "100% free coaching at top empaneled institutes + ₹2,500 per month stipend during coaching duration.",
        "documents_required": "Delhi Caste Certificate / EWS Certificate (< ₹8L), 10th/12th marksheets, Aadhaar",
        "official_website": "https://scstwelfare.delhi.gov.in",
        "search_tags": "delhi jai bhim free coaching ias neet jee stipend 2500 student sc st obc ews",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Delhi"]},
                {"==": [{"var": "is_student"}, True]},
                {"<=": [{"var": "annual_income"}, 800000]},
                {">=": [{"var": "age"}, 16]},
                {"<=": [{"var": "age"}, 30]}
            ]
        }
    },
    {
        "name": "Punjab 300 Units Free Electricity Scheme (Zero Bill)",
        "description": "Provides 300 units of free power per month (600 units per bi-monthly billing cycle) to all domestic consumers in Punjab.",
        "category": "Housing",
        "state_applicable": "Punjab",
        "benefits": "Zero electricity bill for domestic households consuming up to 300 units per month.",
        "documents_required": "PSPCL Electricity Account Number, Aadhaar Card, Punjab Domicile",
        "official_website": "https://pspcl.in",
        "search_tags": "punjab free electricity 300 units zero power bill pspcl domestic",
        "rule": {
            "==": [{"var": "state"}, "Punjab"]
        }
    },
    {
        "name": "Punjab Mukhyamantri Teerth Yatra Scheme",
        "description": "Free pilgrimage travel, air-conditioned train/bus transport, boarding, lodging, and medical assistance for senior citizens in Punjab.",
        "category": "Senior Citizens",
        "state_applicable": "Punjab",
        "benefits": "100% free AC travel, AC accommodation, and food to major religious pilgrimage sites across India.",
        "documents_required": "Age Proof (Aadhaar >= 60 yrs), Punjab Domicile, Medical fitness certificate",
        "official_website": "https://punjab.gov.in",
        "search_tags": "punjab teerth yatra free pilgrimage senior citizen tour travel train",
        "rule": {
            "and": [
                {"==": [{"var": "state"}, "Punjab"]},
                {">=": [{"var": "age"}, 60]}
            ]
        }
    }
]


class Command(BaseCommand):
    help = 'Seed 115+ real Indian government schemes with JSON Logic eligibility rules'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        self.stdout.write(f"Starting seeding of {len(SCHEMES_DATA)} government schemes...")

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
            safe_name = scheme.name.encode('ascii', errors='replace').decode('ascii')
            self.stdout.write(f"[{status}]: {safe_name}")

        self.stdout.write(self.style.SUCCESS(
            f'\nSuccessfully seeded! Total: {len(SCHEMES_DATA)} schemes processed ({created_count} created, {updated_count} updated).'
        ))
