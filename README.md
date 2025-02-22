# 🏋️ Training Locations Registration Application

This is a project for a breaking training locations registration application, where users can register and view training locations on a map. The application uses hCaptcha to prevent spam and implements a search for municipalities and registered locations via the Nominatim API.

## 📋 Features

- **Training Locations Registration**: Allows users to register a training location by filling in information like name, address, city, state, and phone.
- **Location Mapping**: Users can click on the map to set latitude and longitude coordinates. The address is reverse-geocoded to display the corresponding address.
- **Bot Protection**: hCaptcha implementation to verify user authenticity during registration.
- **Map Display and Navigation**: View registered locations on an interactive map.

## 🚀 Technologies

The main technologies and libraries used in this project are:

- **React** + **TypeScript** for building the interface
- **React-Leaflet** for map display and interactions
- **hCaptcha** for bot protection
- **Axios** for API communication
- **Styled Components** and **Tailwind CSS** for styling
- **Express**, **Node.js** for the backend
- **Prisma** ORM for database management
- **Shadcn** for some UI components

## 🔧 Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/aericki/breakinglocations-frontend.git
    cd breaking-locations
    ```

2. Install dependencies:
    ```bash
    npm install
    ```
    or 
    ```bash
    yarn add && yarn
    ```

3. Configure the `.env` file with the following variables:

    ```
    DATABASE_URL="SQLITE or your preferred backend"
    ```

4. Run Prisma migration:

    In the backend folder:

    ```bash
    npx prisma migrate dev --name init
    ```

5. Start the frontend in the folder:
    ```bash
    npm run dev
    ```

6. Access the application at `http://localhost:5173`.

## 📌 Usage

### Location Registration

Home Page.

1. Open the registration form.
2. Click on the map to set the exact location, which will automatically fill in the address.
3. Fill in the location details, if the address or city does not appear, enter it manually (name, address, city and phone).
4. Complete the hCaptcha and click "Register."


## ⚙️ API Endpoints

- **POST /api/register**: Registers a new training location.
- **GET /api/locations**: Returns all registered locations.

## 🤝 Contributing

1. Fork the project.
2. Create a branch for your feature (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a Pull Request.

---

Created by [Aéricki Ferreira](https://github.com/aericki) with 💙  
Instagram: [@aery_abc](https://www.instagram.com/aerickiferreira)
