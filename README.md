# Havn | Property Management System

## 1. Project Description
**Havn** is a server-side rendered web application designed to streamline the relationship between property owners, managers, and tenants. The platform allows property owners to list and manage residential units, while providing tenants with a secure portal to view their lease details and manage maintenance requests. This project demonstrates backend principles including MVC architecture, session-based authentication, and relational database management.

## 2. Database Schema
*Note: The ERD above was exported from pgAdmin and illustrates the relationships between Users, Properties, Units, Leases, and Maintenance Requests[cite: 90].*



## 3. User Roles
The system utilizes three distinct roles to manage access and permissions[cite: 26, 91]:

* **Admin (Owner):** Has full control over the system, including the ability to add or delete properties, manage all user accounts, and view site-wide operational data.
* **Manager (Secondary Role):** Responsible for day-to-day operations, such as updating property availability and managing the maintenance workflow.
* **Tenant (Standard User):** Access is limited to their own personal data, where they can view their lease and submit/track maintenance requests.

## 4. Test Account Credentials
To test the different permission levels of the application, please use the following accounts. 

| Role | Email/Username | Password |
| :--- | :--- | :--- |
| **Admin** | admin@havn.com | `P@$$w0rd!` |
| **Manager** | manager@havn.com | `P@$$w0rd!` |
| **Tenant** | tenant@havn.com | `P@$$w0rd!` |

*Note: All accounts use the same required testing password.*

## 5. Known Limitations


---

### Technical Stack
* **Backend:** Node.js with Express.js 
* **Module System:** ECMAScript Modules (ESM) 
* **Database:** PostgreSQL 
* **Templating:** EJS or Liquid.js 
* **Authentication:** Session-based with `express-session` and `bcrypt` 
* **Deployment:** Render 
