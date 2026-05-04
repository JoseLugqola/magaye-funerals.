# Functional Specification Document (FSD)
## Magaye Funerals Platform

**Version:** 1.0  
**Date:** May 2026  
**Project:** Magaye Funerals Digital Subscription & Management System  

---

## 1. Introduction
The Magaye Funerals platform is a comprehensive digital ecosystem designed to streamline funeral parlor operations and enhance the customer experience. It provides a public-facing informational portal, a self-service customer dashboard for policyholders, and an administrative backend for staff to manage policies, payments, and claims.

## 2. System Architecture & Tech Stack
- **Frontend:** HTML5, CSS3 (Vanilla, CSS Variables, Custom Media Queries), JavaScript (ES6+).
- **UI/UX Design:** Modern, premium aesthetic featuring glassmorphism, responsive grid layouts, and custom typography (Outfit font). Fully optimized for both Android and iOS mobile devices.
- **Data Persistence:** Client-side LocalStorage (Mock API simulation layer) facilitating seamless end-to-end functionality without a live backend during the current deployment phase.
- **Icons:** Lucide Icons.

## 3. User Roles
The platform identifies three distinct user personas:
1. **Guest (Unauthenticated User):** General public browsing plans, learning about the parlor, and initiating the registration process.
2. **Customer (Policyholder):** Authenticated members who have active funeral cover plans.
3. **Staff (Administrator):** Authorized parlor employees responsible for daily operations, data entry, and claim approvals.

---

## 4. Functional Requirements

### 4.1 Public Portal (Guests)
- **FR 1.1 - Landing Page:** System must display a high-conversion landing page with core services, trust indicators, and clear call-to-action (CTA) buttons.
- **FR 1.2 - Plan Comparison:** System must present the available plans (Basic, Standard, Heritage) with tiered pricing and detailed benefits.
- **FR 1.3 - Contact System:** System must provide an emergency contact banner, an interactive contact form, and an FAQ section.
- **FR 1.4 - Self-Registration:** Guests must be able to complete a multi-step digital onboarding process capturing personal details, plan selection, dependent details, and policy consent.

### 4.2 Customer Portal (Policyholders)
- **FR 2.1 - Authentication:** Customers must be able to log in using their 13-digit South African ID number and password.
- **FR 2.2 - Dashboard Overview:** System must display the active plan, monthly premium, next payment due date, and policy status.
- **FR 2.3 - Dependant Management:** Customers must be able to view registered dependants and digitally add new dependants (including ID uploads).
- **FR 2.4 - Digital Claims:** Customers must be able to initiate a digital claim by providing the deceased's details, date of incident, and uploading supporting documentation (Death Certificate/ID).
- **FR 2.5 - Policy Documentation:** Customers must be able to view and print their official Policy Activation Certificate (`active_policy.html`) and read the full legal terms (`full_policy.html`).

### 4.3 Staff Portal (Administrators)
- **FR 3.1 - Authentication:** Staff must log in via a dedicated secure portal (`staff_login.html`).
- **FR 3.2 - Executive Dashboard:** System must display aggregate analytics including Total Members, Monthly Revenue, Pending Claims, and Recent Activity logs.
- **FR 3.3 - Member Registration:** Staff must be able to manually capture and register walk-in clients.
- **FR 3.4 - Member Directory:** Staff must have access to a searchable, filterable grid of all active, suspended, and lapsed policyholders.
- **FR 3.5 - Payment Processing:** Staff must be able to record cash/EFT payments against specific member profiles, instantly updating their status and generating digital receipts.
- **FR 3.6 - Claims Management:** Staff must be able to review submitted digital claims, verify documents, and transition claim statuses (Pending -> Approved/Rejected).

---

## 5. Non-Functional Requirements
- **NFR 1 - Mobile Responsiveness:** 100% functional parity on mobile devices. Grids must collapse to single columns, and navigation must convert to an off-canvas slide-out menu on screens `< 900px`.
- **NFR 2 - Performance:** The application must utilize lightweight native browser APIs to ensure sub-second page loads and seamless transitions.
- **NFR 3 - Security:** Staff and Customer routes must strictly segregate data views. (Simulated via session flags in current architecture).
- **NFR 4 - Usability:** The interface must use high-contrast text, clear visual hierarchies, and recognizable iconography to accommodate users of varying technical literacy.

---
*End of Document*
