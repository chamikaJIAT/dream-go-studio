# MySQL Setup Guide

To connect your project to a MySQL database, follow these steps:

## 1. Get your Database Connection Details
If you are using a hosting provider (like Hostinger, Bluehost, etc.), create a MySQL database in your control panel (cPanel).

- **Host:** Usually \`localhost\` if the database is on the same server, or an IP address/hostname provided by your host.
- **Port:** Default is \`3306\`.
- **Database Name:** The name you gave to your database.
- **User:** The username you created for the database.
- **Password:** The password for that database user.

## 2. Update Environment Variables

### Server \`.env\` (\`server/.env\`)
Update these lines with your actual details:
\`\`\`env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_mysql_db_name
DB_PORT=3306

ADMIN_NAME=System Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
\`\`\`

## 3. Verify Connection
Run the following command in your terminal:
\`\`\`powershell
node server/check_db.js
\`\`\`
If successful, it will:
1. Initialize the database (Create all tables automatically).
2. Create a default admin account.
3. Print the count of Admins, Users, and Bookings.

## 4. Run the Server
Once the details are updated, start your server:
\`\`\`bash
cd server
npm run dev
\`\`\`
The server will automatically handle table creation on first run.
