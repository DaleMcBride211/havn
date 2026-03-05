# Havn | Property Management System

## 1. Project Description
[cite_start]**Havn** is a server-side rendered web application designed to streamline the relationship between property owners, managers, and tenants[cite: 89, 102]. [cite_start]The platform allows property owners to list and manage residential units, while providing tenants with a secure portal to view their lease details and manage maintenance requests[cite: 52, 66]. [cite_start]This project demonstrates mastery of backend principles including MVC architecture, session-based authentication, and relational database management[cite: 4, 38].

## 2. Database Schema
![Entity Relation Diagram]()  
[cite_start]*Note: The ERD above was exported from pgAdmin and illustrates the relationships between Users, Properties, Units, Leases, and Maintenance Requests[cite: 90].*



## 3. User Roles
[cite_start]The system utilizes three distinct roles to manage access and permissions[cite: 26, 91]:

* [cite_start]**Admin (Owner):** Has full control over the system, including the ability to add or delete properties, manage all user accounts, and view site-wide operational data[cite: 27, 68, 70].
* [cite_start]**Manager (Secondary Role):** Responsible for day-to-day operations, such as updating property availability and managing the maintenance workflow[cite: 28, 71].
* [cite_start]**Tenant (Standard User):** Access is limited to their own personal data, where they can view their lease and submit/track maintenance requests[cite: 29, 75].

## 4. Test Account Credentials
[cite_start]To test the different permission levels of the application, please use the following accounts[cite: 92]. 

| Role | Email/Username | Password |
| :--- | :--- | :--- |
| **Admin** | admin@havn.com | `P@$$w0rd!` |
| **Manager** | manager@havn.com | `P@$$w0rd!` |
| **Tenant** | tenant@havn.com | `P@$$w0rd!` |

[cite_start]*Note: All accounts use the same required testing password[cite: 92, 93].*

## 5. Known Limitations


---

### Technical Stack
* [cite_start]**Backend:** Node.js with Express.js [cite: 8]
* [cite_start]**Module System:** ECMAScript Modules (ESM) [cite: 10]
* [cite_start]**Database:** PostgreSQL [cite: 11]
* [cite_start]**Templating:** EJS or Liquid.js [cite: 9]
* [cite_start]**Authentication:** Session-based with `express-session` and `bcrypt` [cite: 22, 23]
* [cite_start]**Deployment:** Render [cite: 12]