import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Buses from "./pages/Buses";
import Orders from "./pages/Orders";
import Employees from "./pages/Employees";
import Admin from "./pages/Admin";
import Sells from "./pages/Sells";
import Driver from "./pages/Driver";
import Tripa from "./pages/Tripa";
import ProtectedRoute from "./components/ProtectedRoutes";
import TripDetails from "./pages/TripDetails";
import ReadyTrips from "./pages/ReadyTrips";
import { LanguageProvider } from "./contexts/LanguageContext.jsX";
import Incomes from "./pages/Incomes";
import Copones from "./pages/Copones";
import RatingsLink from "./pages/RatingsLink";
import TicketPrint from "./components/TicketPrint";

function App() {
  return (
    <LanguageProvider>

    <BrowserRouter>

      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bus"
          element={
            <ProtectedRoute>
              <Buses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admins"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sells"
          element={
            <ProtectedRoute>
              <Sells />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver"
          element={
            <ProtectedRoute>
              <Driver />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <Tripa />
            </ProtectedRoute>
          }
        />

         <Route
          path="/tripdetails"
          element={
            <ProtectedRoute>
              <TripDetails/>
            </ProtectedRoute>
          }
        />

         <Route
          path="/chalans"
          element={
            <ProtectedRoute>
              <ReadyTrips/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/incomes"
          element={
            <ProtectedRoute>
              <Incomes/>
            </ProtectedRoute>
          }

          />

          <Route
          path="/copones"
          element={
            <ProtectedRoute>
              <Copones/>
            </ProtectedRoute>
          }


        />



         <Route
          path="/generate-link"
          element={
            <ProtectedRoute>
              <RatingsLink/>
            </ProtectedRoute>
          }


        />

        
         <Route
          path="/ticketprint"
          element={
            <ProtectedRoute>
              <TicketPrint/>
            </ProtectedRoute>
          }


        />

       <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History/>
            </ProtectedRoute>
          }


        />





      </Routes>
    </BrowserRouter>
  </LanguageProvider>
  );
}

export default App;
