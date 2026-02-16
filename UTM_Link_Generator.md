PROMPT — UTM Link Generator (WagnerRosa.com)

I need to generate a UTM-tracked link for wagnerrosa.com.

Follow strictly the UTM taxonomy defined below.

Base Domain

https://wagnerrosa.com/

(If I specify a specific page, use that URL instead.)

⸻

UTM Rules

Use this structure:

?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN

All values must:
	•	Be lowercase
	•	Use underscores
	•	Contain no accents
	•	Follow the predefined taxonomy
	•	Not invent new naming patterns

⸻

Taxonomy

utm_source

Allowed values:
	•	linkedin
	•	instagram
	•	github
	•	behance
	•	medium
	•	cv
	•	email
	•	recruiter
	•	community
	•	event

⸻

utm_medium

Allowed values:
	•	social
	•	document
	•	email
	•	referral
	•	direct_outreach
	•	messaging
	•	community

⸻

utm_campaign

Portfolio
	•	portfolio
	•	portfolio_profile
	•	portfolio_networking

Insights
	•	insights
	•	insight_post
	•	thought_leadership

Case Study
	•	case_study
	•	case_promotion

Job Outreach
Format strictly:

job_[company]_[year]

Company name:
	•	lowercase
	•	no spaces
	•	no accents

Example:
job_nubank_2026

⸻

Output Format

Return only:
	1.	The final UTM link.
	2.	A short breakdown explaining:
	•	source
	•	medium
	•	campaign

No extra commentary.

⸻

🔎 Example Usage

If you write:

Generate a link for my CV sent to Nubank in 2026.

The correct output should be:

https://wagnerrosa.com/?utm_source=cv&utm_medium=document&utm_campaign=job_nubank_2026


⸻
If you write:

Generate a link for sharing my Architecture of Intelligence article on LinkedIn.

The output should be:

https://wagnerrosa.com/insights/architecture-of-intelligence.html?utm_source=linkedin&utm_medium=social&utm_campaign=insight_post

⸻

🎯 Why this works

Now you have:
	•	A deterministic UTM generator
	•	No inconsistent campaign names
	•	No broken analytics
	•	Strategic clarity across outreach
