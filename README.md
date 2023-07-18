# AstroCloud 🪐

This project was developed by ([Romain Bidault](https://github.com/Hulcox)).<br>
It is a web application with a custom API to generate virtual machines with Microsoft Azure.

## 1. Requirements 🚨

Minimum Node.js version: v16<br>
Minimum NPM version: v8 (will be installed with Node.js)

## 2. Technologies Used ‍💻

**Express**: A server-side JavaScript runtime environment.<br>
**Next.js**: A React framework for building server-side rendered and statically generated web applications.<br>
**Express**: A fast and minimalistic Node.js web application framework for building APIs and server-side applications.<br>
**Azure SDK**: A library that enables interaction with various Azure services for cloud computing and management.

## 3. How to Install and Use the Application 📇

In the client folder, change the localhost in the .env file to the machine's IP address:

```
NEXT_PUBLIC_API_URL="http://{your ip}:3030/api"
```

In the server folder, change the following IDs in the .env file to your Azure IDs:

```
AZURE_TENANT_ID={your_tenant_id}
AZURE_CLIENT_ID={your_client_id}
AZURE_CLIENT_SECRET={your_client_secret}
AZURE_SUBSCRIPTION_ID={your_subscription_id}
DELETE_TIME={time to delete vm in ms}
```

To start the application, go to the root of the project and run the following command:
```
npm run start
```

**⚠️ IMPORTANT: if you have an error try to install in folder server tr46 `npm install tr46@latest` ⚠️**
after do this folowing commande if never change
```
cd /server
npm cache clean --force
rm -rf node_modules
rm -rf package-lock.json
npm install

and

cd /client
npm cache clean --force
rm -rf node_modules
rm -rf package-lock.json
npm install
```

When you see "Server Front started" and "Server Back started" in blue in the terminal, you can open [http://localhost:3000](http://localhost:3000) to view the application in your browser.<br>

**⚠️ IMPORTANT: DO NOT USE INTERNET EXPLORER TO RUN THE APPLICATION ⚠️**

### 3.4. App Login 🔑

This application has 3 users with different access rights:

|   | Username             | Password        | Description                                  |
|:--|:---------------------|:----------------|:---------------------------------------------|
| 1 | romain@test.fr       | romaintest      | This user has all access and can create several VMs.                                              |
| 2 | okthibault@gmail.com | okthibault      | This user is limited, they can only create one type of VM (Debian) and only if there are no others active. |
| 3 | melanie@zetofrais.fr | melaniezetofrais| This user has no credit and therefore cannot create a VM.                     |

You can use these credentials to login to the application, and you can modify them or create another one in the SQLite database `server/database/astrocloud.db` file.

### 3.5. Using the Application 🖱️

Once logged in, you will be redirected to the dashboard.<br>

You can create a VM by clicking on the "Crée une machine" button.<br>

After creating a VM, the VM will be added to the VM list and will be deleted after 10 minutes.<br>

to connect to the vm use this `user: AstroCloudAdmin` and this `password: AstroCloud%SDV//`.<br>

## 4. Application Structure 🗂️

The application is composed of the following files and folders:

### 4.1. Frontend (/client folder) 🎨

#### 4.1.1 src folder 📂

- `src/app`: The main folder with all pages of this application.
- `src/components`: All React components used in this application.
- `src/index.js`: The React starting code.

#### 4.1.2 public folder 📂

- `public/icon.png`: The icon of the application.
- `public/images`: Folder with other images used in this application.

### 4.2. Backend (/server folder) 🔐

- `index.js`: The main file of the backend (Node.js starting code).
- `azure.js`: Contains the code related to VM creation.
- `tools/token.js`: Contains the code to generate tokens for authentication.
- `src/database/astrocloud.db`: Contains all the users and machines of the application (SQLite database).
- 
### 4.3. DataBase (exemple data) 🔐
- table users :

|   | id | name        | credit  | email                 | password       |
|:--|:---|:------------|:--------|:----------------------|:---------------|
| 1 | 1  | JohnDoe     | 100     | johndoe@anonimus.test | johndoethebest |
  
- table machine :

|   | id | name        | uptime      | active  | created_at         | id_user |
|:--|:---|:------------|:------------|:--------|:-------------------|:--------|
| 1 | 1  | 192.168.0.1 | 10 (minute) | true    | 15/07/2023T18:52:00| 1       |
  

