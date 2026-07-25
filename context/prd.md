# Hostel Allotment Software — Product Requirements Document (PRD)

**Version 0.2 · Draft · 2026-07-25**

---

## 1. Overview

This document describes the requirements for the Hostel Allotment Software, a system that collects hostel-preference data from students, validates it against official admission records, runs a merit-based room-allotment algorithm separately for male and female students, and publishes an admin-confirmed allotment list to all students by email and PDF.

It is based on the workflow diagram provided, translated into a structured PRD with functional requirements, data flow, and suggested improvements.

## 2. Goals & Objectives

- Digitize and standardize the hostel room allotment process, removing manual/spreadsheet-based assignment.
- Ensure only genuinely admitted students (per admission records) are eligible for room allotment, automatically excluding students who filled the form but later cancelled their admission.
- Allot the limited, fixed pool of rooms fairly and consistently based on merit rank.
- Give the admin a final human checkpoint (confirmation) before any list becomes official.
- Notify all students automatically once allotment is published, regardless of whether they received a room.

## 3. Actors & Roles

| Actor | Description | Key Actions |
|---|---|---|
| Student | Applicant seeking a hostel seat | Fills allotment form; receives form-submitted acknowledgement; receives final allotment list by email |
| Admin | Hostel/admissions office staff | Uploads/maintains admission data; reviews and confirms boys/girls allotted lists; triggers publish |
| Allotment Software | The system itself | Cross-checks form data against admission data, splits by gender, runs merit-based allotment algorithm, generates lists, sends emails |

## 4. End-to-End Workflow

1. **Form submission** — A student fills out the hostel allotment form (personal details, JEE roll number, preferences, etc.).
2. **Acknowledgement** — On submission, the system immediately sends a "form submitted successfully" confirmation to the student.
3. **Verification (against admission data)** — The student form record's JEE roll number (primary key) is matched to the JEE roll number (foreign key) in the admission data, which the admin maintains as the single source of truth.
   - Admission data is treated as the **authentic, authoritative record** — it, not the form, decides who is actually eligible.
   - Students who filled the form but whose admission was later **cancelled** (i.e., no longer present/valid in admission data) are **identified and removed** at this step; they do not proceed to allotment.
4. **Gender-based split** — Verified records are split into two lists: **Verified Student List (Male)** and **Verified Student List (Female)**.
5. **Allotment algorithm (merit-based)** — Each list is passed through its own instance of the allotment algorithm, which assigns a **Hostel ID** and **Room Number** to students based on **merit rank**.
   - Room inventory is **fixed** — the number of rooms does not change to fit demand.
   - Because rooms are limited, **not every verified student will receive a room**; the algorithm allots strictly by merit rank until capacity is exhausted, and remaining (lower-rank) students simply do not get a room in this cycle.
6. **Allotted lists** — The algorithm output produces a **Boys Allotted Student List** and a **Girls Allotted Student List**, which should also make clear which verified students did *not* receive a room.
7. **Admin confirmation** — The admin reviews both lists in the admin panel and confirms each one independently.
8. **Publishing** — Once both lists are confirmed, a combined **Hostel Allotment List** is published as a PDF.
9. **Notification** — The full allotment list/result is emailed to students.

## 5. Functional Requirements

### 5.1 Student Form
- Capture required fields: name, JEE roll number, gender, contact info, hostel/room preferences (if any), category (if applicable).
- Client- and server-side validation before submission.
- On successful submission, trigger an immediate acknowledgement (email/SMS/in-app) confirming the form was received. This is a receipt only, not an allotment result.
- Prevent duplicate submissions per student (idempotency), keyed on JEE roll number.

### 5.2 Admission Data (Authoritative Source)
- Admin maintains/uploads the official admission data (bulk upload, e.g. CSV/Excel, or integration with an admissions system), keyed by JEE roll number.
- This dataset is the source of truth for eligibility — it reflects current, confirmed admissions and excludes students who have cancelled.
- Should support periodic re-upload/refresh so that admission cancellations occurring after the initial upload are reflected before verification runs.

### 5.3 Verification Engine
- For each student form submission, look up the JEE roll number (primary key) against the admission data's JEE roll number (foreign key).
- If a match exists in admission data → student is verified and proceeds to allotment.
- If no match exists (student cancelled admission, or never actually admitted) → student is **excluded** from allotment.
- Flag/list excluded records so the admin has visibility into who was removed and why (useful for handling disputes/queries).

### 5.4 Gender-Based Segmentation
- Split verified records into Male and Female lists based on a gender field from the form or admission data.
- Design should allow additional segmentation dimensions in future (e.g., by category, differently-abled, year of study) without a full rebuild.

### 5.5 Allotment Algorithm (Merit-Based)
- Input: verified student list (per gender, ranked by merit) + fixed hostel/room inventory (capacity, room type, floor, gender designation).
- Output: Hostel ID and Room Number assigned per student, strictly in merit-rank order until rooms run out.
- Must respect fixed capacity — no over-allotment of any room/hostel.
- Must clearly mark students who did not receive a room due to capacity limits (rather than omitting them silently), so the admin and the student both see the outcome.

### 5.6 Admin Review & Confirmation
- Admin panel displays Boys Allotted List and Girls Allotted List separately, with room/hostel details per student, and clearly indicates students who did not get a room.
- Admin can review and confirm each list independently.
- Unconfirmed lists cannot be published.
- System should log who confirmed, and when, for audit purposes.

### 5.7 Publishing & Notification
- On confirmation of both lists, generate a combined, finalized Hostel Allotment List as a PDF.
- Publish the PDF to a student-accessible location (portal/notice board).
- Email the full allotment list/result to all students (not restricted to individual records).
- Provide delivery status tracking (sent/failed) for the notification batch.
- Note: if a correction is needed after publishing, it is handled by **manually repeating the whole process** on the software from the start — no separate automated re-publish flow is required.

## 6. Data Considerations

- The join key between student form data and admission data is the **JEE roll number** (form = primary key, admission data = foreign key).
- Admission data is authoritative; the form is only a preference/data-collection layer on top of it.
- Maintain an audit trail: form submission timestamp, verification result (matched/excluded), algorithm run ID, admin confirmation timestamp, publish timestamp, email delivery status.
- Store hostel/room inventory as its own entity (hostel ID, room ID, capacity, gender designation, room type) reflecting the fixed number of available rooms.

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | Student PII and admission data must be encrypted at rest and in transit; admin actions role-based and logged. |
| Reliability | Email/notification delivery should retry on failure. |
| Scalability | Verification and allotment should handle bulk intake (e.g., thousands of students during admission season) without manual batching. |
| Auditability | Every allotment decision (and every exclusion during verification) should be traceable back to the algorithm run and the admission-data snapshot used. |
| Usability | Admin panel should clearly distinguish allotted vs. not-allotted (due to capacity) vs. excluded (cancelled admission) students. |

## 8. Suggested Improvements

### 8.1 Make exclusion at verification visible to the admin
Since students who cancelled admission but filled the form are silently removed, give the admin a visible "excluded/cancelled" list at the verification step — useful for handling student queries like "why didn't I get an allotment email."

### 8.2 Clearly separate "not allotted (no rooms left)" from "excluded (cancelled admission)"
These are two very different outcomes for a student and should be labeled distinctly everywhere — in the admin panel, in the published list, and in the final email — so students understand why they didn't get a room.

### 8.3 Version the admission-data snapshot used for each allotment run
Since admission data can be refreshed (cancellations happening over time), tag each allotment run with which admission-data snapshot/version it used. This matters if the whole process is later manually repeated — the admin should be able to tell what changed between runs.

### 8.4 Keep the "form submitted" acknowledgement clearly separate from the allotment result
Since the final result (allotted or not) only comes later after verification, gender split, algorithm run, and admin confirmation, make sure the initial "form submitted successfully" message is clearly worded as a receipt, not a confirmation of a room.

### 8.5 Capacity visibility for admin before confirming
Show the admin how many verified students exist per gender vs. how many rooms are available, so the expected "not allotted" count is visible before confirming — this helps catch data issues early (e.g., admission data not refreshed, wrong inventory numbers).

## 9. Open Questions

- How and how often is admission data refreshed/re-uploaded to capture new cancellations before an allotment run?
- Is merit rank sourced from JEE rank directly, or a derived/internal rank computed by the institute?
- Are there reserved-category or special-accommodation rules that should apply *within* the merit-based ordering (e.g., quota seats)?
- When the whole process is manually repeated (per Section 5.7), should previously allotted students' rooms be preserved/locked, or can the merit-based algorithm reassign everyone from scratch each time?