# StockFlow Africa

STOCKFLOW AFRICA — BUILD 01

Enterprise Inventory & Stores Management Platform

Foundation, Multi-Tenancy, Authentication, RBAC & Core Inventory Architecture

Build a production-ready SaaS inventory and stores management platform called StockFlow Africa.

StockFlow is designed for African businesses and institutions that need to manage central stores, departmental stores, food supplies, tuckshop stock, fuel and fuel coupons, office materials, poultry/agricultural supplies, assets, breakages, losses, stocktakes, inventory valuation and complete audit trails.

This is BUILD 01.

DO NOT attempt to build every future module in this prompt. Build the foundation correctly so later modules can be added without restructuring the database or authentication architecture.

1. TECHNOLOGY

Use:

React

TypeScript

Vite

Tailwind CSS

shadcn/ui where appropriate

Supabase

PostgreSQL

Supabase Authentication

PostgreSQL Row Level Security

Lucide icons

Responsive design

Do NOT use a fake/mock backend.

All important data must persist in Supabase.

Do NOT use localStorage as the primary database.

Design the architecture so it can eventually support:

Android mobile application

Barcode scanning

QR scanning

Offline synchronization

Notifications

Subscription billing

Multiple organizations

Enterprise deployments

2. PRODUCT IDENTITY

Product:

STOCKFLOW AFRICA

Tagline:

"Central Stores. Departmental Stores. Complete Control."

Design language:

Modern enterprise software.

The interface should feel like a professional ERP rather than a generic CRUD dashboard.

Use:

clean cards

professional tables

clear status badges

responsive side navigation

excellent spacing

accessible typography

subtle animations

strong empty states

confirmation dialogs

loading states

skeleton states

error states

Primary visual direction:

Deep professional blue/navy with neutral surfaces and restrained accent colors.

Avoid excessive gradients.

Avoid childish UI.

The system must look credible enough for:

schools

colleges

NGOs

farms

hotels

restaurants

companies

government institutions

warehouses

manufacturing businesses

3. MULTI-TENANT ARCHITECTURE

StockFlow must be MULTI-TENANT.

An organization is a customer/tenant.

Example:

Organization A
Organization B
Organization C

Their data MUST NEVER be accessible to each other.

Every organization-owned database record must contain an organization/tenant relationship.

Implement PostgreSQL Row Level Security.

Never rely solely on frontend filtering to isolate organizations.

The database must enforce tenant isolation.

The future Supreme Admin must be able to manage the platform across organizations without exposing one organization's data to another ordinary user.

4. USER HIERARCHY

Implement the following roles.

SUPREME ADMIN

This is the StockFlow platform owner.

Capabilities:

manage organizations

manage organization administrators

view system-wide statistics

manage subscriptions in future

manage system configuration

suspend organizations in future

access global audit functions

monitor platform activity

IMPORTANT:

Supreme Admin is ABOVE the organization level.

Do not treat Supreme Admin as an ordinary organization user.

ORGANIZATION ADMIN

Controls one organization.

Can:

manage departments

manage stores

manage users

manage inventory configuration

manage suppliers

configure categories

view reports

manage permissions

oversee stock operations

CENTRAL STORE MANAGER

Can:

manage Central Store

receive stock

issue stock

transfer stock

view stock cards

perform stocktakes

manage store operations

STORE CLERK

Can:

receive stock where authorized

process issues

process transfers where authorized

conduct stock counts

record operational transactions

Cannot approve their own restricted transactions.

DEPARTMENT HEAD

Can:

view departmental inventory

create requisitions

approve departmental requests

view departmental consumption

authorize departmental stock operations

FINANCE

Can:

view inventory valuation

view purchase costs

view stock movement values

view financial reports

view inventory-related transactions

Do not automatically give Finance permission to modify physical stock.

AUDITOR

Read-only access.

Can view:

stock movements

users

approvals

adjustments

breakages

losses

stocktakes

audit logs

reports

Auditors cannot modify operational records.

5. DATABASE FOUNDATION

Create a normalized PostgreSQL database.

At minimum create structures for:

organizations

profiles/users

roles

user_roles

departments

stores

store_users

categories

units_of_measure

items

suppliers

stock_balances

stock_ledger

audit_logs

Do not duplicate unnecessary information.

Use UUID primary keys.

Use created_at and updated_at timestamps.

Use foreign keys.

Use appropriate indexes.

Use database constraints wherever possible.

6. ORGANIZATIONS

Organization fields should include:

id

name

organization_code

description

email

phone

address

city

country

currency

timezone

logo_url

status

created_at

updated_at

Default country:

Zimbabwe

Default currency:

USD

However, do NOT hard-code Zimbabwe throughout the application.

The architecture must support other African countries and currencies.

7. DEPARTMENTS

Departments belong to an organization.

Examples:

Administration

Finance

Human Resources

Kitchen

Poultry

Agriculture

Tuckshop

Maintenance

ICT

Transport

Production

But departments must be dynamic.

The organization administrator can:

CREATE
EDIT
ACTIVATE
DEACTIVATE

departments.

Fields:

id

organization_id

name

code

description

manager

status

created_at

updated_at

8. STORES

A store belongs to an organization.

A store can optionally belong to a department.

Support:

CENTRAL STORE

and

DEPARTMENTAL STORE.

Examples:

Central Stores

Kitchen Store

Poultry Store

Tuckshop Store

Maintenance Store

Fuel Store

Office Supplies Store

Fields:

id

organization_id

department_id nullable

name

code

store_type

location

manager_id

status

created_at

updated_at

Store types:

CENTRAL

DEPARTMENTAL

SPECIALIZED

9. INVENTORY CATEGORIES

Categories must be configurable.

Examples:

Food Supplies

Tuckshop

Fuel

Office Materials

Poultry

Agriculture

Maintenance

ICT

Cleaning Materials

Building Materials

Assets

Other

Organization administrators must be able to create custom categories.

10. UNITS OF MEASURE

Create configurable units.

Examples:

Each

Piece

Box

Carton

Bag

Kilogram

Gram

Litre

Millilitre

Metre

Roll

Packet

Dozen

Tray

Bottle

Drum

Barrel

The system must NOT assume every item is measured in "pieces".

11. ITEMS

Create the master inventory item table.

Fields should include:

id

organization_id

category_id

item_code

name

description

unit_of_measure_id

barcode

sku

minimum_stock_level

reorder_level

maximum_stock_level

default_unit_cost

track_batch

track_expiry

track_serial_number

active

created_at

updated_at

Item codes must be unique within an organization.

Barcode should be nullable because not every item will have a barcode.

12. SUPPLIERS

Create supplier management.

Fields:

id

organization_id

supplier_code

name

contact_person

phone

email

address

tax_number

payment_terms

status

created_at

updated_at

13. THE STOCK LEDGER

THIS IS THE MOST IMPORTANT PART OF THE ENTIRE SYSTEM.

Do NOT design stock management as simply changing a quantity field.

Every stock movement must generate an immutable ledger transaction.

Create a stock_ledger structure containing information such as:

id

organization_id

transaction_reference

transaction_type

item_id

store_id

department_id nullable

quantity

unit_cost

total_value

balance_after

source_store_id nullable

destination_store_id nullable

user_id

reason

related_transaction_id nullable

transaction_date

created_at

Transaction types should support future expansion.

Examples:

RECEIPT

ISSUE

TRANSFER_OUT

TRANSFER_IN

RETURN

BREAKAGE

LOSS

ADJUSTMENT

STOCKTAKE_ADJUSTMENT

OPENING_BALANCE

14. IMMUTABLE TRANSACTIONS

Once a stock ledger transaction has been finalized:

DO NOT allow ordinary users to edit or delete it.

If an error occurs:

create a REVERSAL or corrective transaction.

The original transaction remains in the audit history.

This is essential for accountability.

15. STOCK BALANCES

Create a stock_balances structure that allows fast retrieval of current inventory.

A balance represents:

Organization

Store

Item

Current quantity

Reserved quantity where required

Available quantity

Average cost

Total value

Updated timestamp

However:

The stock ledger remains the authoritative historical record.

Do not allow users to arbitrarily edit stock_balances.

Stock balances must be updated through controlled transactions.

16. TRANSACTION REFERENCES

Generate human-readable transaction references.

Examples:

GRN-2026-000001

ISS-2026-000001

TRF-2026-000001

RET-2026-000001

ADJ-2026-000001

BRK-2026-000001

LSS-2026-000001

STK-2026-000001

References must be unique.

17. AUDIT LOG

Create a separate audit_logs structure.

Record important actions such as:

LOGIN

LOGOUT

CREATE

UPDATE

DELETE_ATTEMPT

APPROVE

REJECT

RECEIVE_STOCK

ISSUE_STOCK

TRANSFER_STOCK

ADJUST_STOCK

RECORD_BREAKAGE

RECORD_LOSS

STOCKTAKE

USER_CREATED

USER_DISABLED

ROLE_CHANGED

STORE_CREATED

ITEM_CREATED

etc.

Record:

user

organization

action

entity type

entity ID

timestamp

IP/device information where available and appropriate

before data where appropriate

after data where appropriate

Audit logs must be protected from ordinary users.

18. AUTHENTICATION

Use Supabase Authentication.

Support:

email/password login

secure password handling through Supabase Auth

logout

session persistence

password reset

protected routes

Never store plaintext passwords.

Never create a fake authentication system.

19. LOGIN EXPERIENCE

Create a professional login page.

The login experience should determine the user's role after authentication and route them appropriately.

For example:

Supreme Admin
→ Supreme Admin Dashboard

Organization Admin
→ Organization Dashboard

Store Manager
→ Stores Dashboard

Department Head
→ Department Dashboard

Finance
→ Finance Dashboard

Auditor
→ Audit Dashboard

Do not create completely separate authentication systems unless technically necessary.

Use one secure authentication infrastructure with role-based routing.

20. SUPREME ADMIN AREA

Create the foundation of a separate Supreme Admin interface.

Navigation:

Dashboard

Organizations

Users

System Activity

Audit

Settings

Future:

Subscriptions

Billing

Platform Analytics

System Health

The Supreme Admin dashboard should display:

Total Organizations

Active Organizations

Total Users

Total Stores

Total Items

Transactions Today

Recent Organizations

Recent Platform Activity

21. ORGANIZATION ADMIN DASHBOARD

Create a professional dashboard showing:

Total Inventory Value

Central Store Value

Departmental Store Value

Total Items

Low Stock Items

Out-of-Stock Items

Pending Requisitions

Recent Stock Transactions

Recent Activity

Top Consuming Departments

The numbers must come from real database data.

Do not use fake hard-coded dashboard numbers.

22. INVENTORY MANAGEMENT UI

Create pages for:

Inventory

Categories

Units

Suppliers

Stores

Departments

Users

Each page should include:

Search

Filtering

Sorting

Pagination

Create

Edit where permitted

View details

Status

Empty states

Loading states

Error handling

23. STOCK CARD

Every item should eventually have a stock-card view.

For now implement the foundation.

Example:

ITEM:

Rice 10kg

STORE:

Central Stores

Current Quantity:

150

Average Cost:

$12.50

Total Value:

$1,875

Then show a transaction history:

DATE
REFERENCE
TYPE
IN
OUT
BALANCE
UNIT COST
VALUE
USER

This must be generated from the stock ledger.

24. PERMISSIONS

Do NOT rely only on role names in frontend code.

Create a permission architecture.

Examples:

inventory.view

inventory.create

inventory.edit

inventory.delete

stock.receive

stock.issue

stock.transfer

stock.adjust

stocktake.create

stocktake.approve

reports.view

users.manage

stores.manage

departments.manage

audit.view

system.manage

Supreme Admin has platform-level permissions.

Organization roles receive permissions appropriate to their role.

Build this so custom roles can be supported later.

25. SECURITY

Implement:

Row Level Security

tenant isolation

protected routes

server/database authorization

input validation

secure error handling

least-privilege permissions

Never expose Supabase service-role credentials in frontend code.

Never bypass RLS from the browser.

Never trust a user-provided organization_id.

Determine the user's permitted organization context from authenticated identity and server/database authorization.

26. SEED DATA

Create safe development seed data only.

Include one demo organization:

"StockFlow Demo Organization"

Departments:

Administration

Finance

Kitchen

Poultry

Maintenance

Tuckshop

Stores:

Central Stores

Kitchen Store

Poultry Store

Maintenance Store

Tuckshop Store

Categories:

Food Supplies

Tuckshop

Fuel

Office Materials

Poultry

Maintenance

ICT

Create a few sample inventory items.

Clearly mark demo data.

Do not make fake transaction data look like production data.

27. DASHBOARD DESIGN

The main organization dashboard should have:

Sidebar

Top navigation

Organization switch/context indicator where applicable

User profile

Notifications placeholder

Global search placeholder

Dashboard cards

Charts

Recent activity

Low-stock widget

Quick actions

Quick actions:

Receive Stock

Issue Stock

Transfer Stock

New Requisition

Add Item

Stocktake

28. RESPONSIVENESS

The system must work properly on:

Desktop

Laptop

Tablet

Mobile

Do not simply shrink the desktop interface.

Tables should have proper responsive behavior.

Navigation should collapse into a mobile menu.

Forms must remain usable on small screens.

29. ERROR HANDLING

Every database operation needs proper:

Loading state

Success state

Error state

Empty state

Do not show raw database errors to users.

Provide useful messages.

Example:

"Unable to save item. Please check the required fields and try again."

Log technical errors appropriately for debugging.

30. ARCHITECTURAL RULE

DO NOT build future modules in a way that requires rewriting the core inventory engine.

The following modules will be added later:

PHASE 2:

Goods Receiving

Purchase Orders

Store Requisitions

Stock Issues

Transfers

Returns

Breakages

Losses

Adjustments

Stocktake

PHASE 3:

FIFO valuation

Weighted average valuation

Inventory valuation reports

Consumption analysis

PHASE 4:

Fuel management

Fuel coupons

Poultry management

Food management

Tuckshop

Expiry tracking

Batch tracking

Asset management

PHASE 5:

Barcode

QR codes

Android application

Offline mode

Notifications

Advanced analytics

PHASE 6:

Subscriptions

Billing

Multi-organization SaaS management

Enterprise controls

31. IMPORTANT BUSINESS RULE

The core principle of StockFlow is:

"NO STOCK MOVES WITHOUT A TRACE."

Every stock movement must have:

WHO

WHAT

WHEN

WHERE

HOW MUCH

AT WHAT COST

WHY

REFERENCE

and, where required:

WHO APPROVED IT

Build the architecture around this principle.

32. QUALITY STANDARD

Do not produce a superficial prototype.

Build clean, maintainable, production-oriented code.

Use reusable components.

Use TypeScript types.

Use database constraints.

Use proper error handling.

Use secure authorization.

Use clear naming conventions.

Avoid duplicated code.

Do not create unnecessary dependencies.

Do not create fake functionality.

If a feature is not yet implemented, show a proper "Coming Soon" or disabled state rather than pretending it works.

33. FINAL REQUIREMENT

Before considering BUILD 01 complete:

Verify authentication works.

Verify role-based routing works.

Verify Supreme Admin is separated from organization users.

Verify organization data isolation.

Verify RLS policies.

Verify departments.

Verify stores.

Verify categories.

Verify units.

Verify inventory items.

Verify suppliers.

Verify stock ledger architecture.

Verify audit logging.

Verify responsive UI.

Verify no secrets are exposed in frontend code.

Verify the application builds successfully.

Fix all TypeScript errors.

Fix all console errors.

Do not leave broken placeholder functionality.

After completing BUILD 01, provide a concise implementation report listing:

database tables created

RLS policies created

authentication implementation

roles implemented

permissions implemented

pages created

components created

remaining planned modules

any configuration required from the developer

any known limitations

Do not proceed to major Phase 2 functionality until BUILD 01 is stable.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://stockflow-africa-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d36afb04-bcc3-4e4f-85c4-8351bb2897fb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
