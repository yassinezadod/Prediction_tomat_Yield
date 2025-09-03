// src/App.tsx

//import { BrowserRouter as Router, Routes, Route } from "react-router";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";

// Pages d'authentification
import SignIn from "./pages/AuthPages/SignIn";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import SignUp from "./pages/AuthPages/SignUp";
import { Toaster } from "react-hot-toast";

// Pages générales
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import PredictionPage from "./pages/prediction/PredictionPage";
import SeeCompareAllPage from "./pages/prediction/SeeCompareAllPage";
import SeeAllPage from "./pages/prediction/SeeAllPage";

import PredictionPageComparaison from "./pages/prediction/PredictionPageComparaison";

import Blank from "./pages/Blank";

import Users from "./pages/users/Users";

// Layout et composants
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import HomeAdmin from "./pages/Dashboard/HomeAdmin";
import { PredictionCsvProvider } from "./context/PredictionCsvContext";
import HistoryAll from "./pages/history/HistoryAll";



// Pages Admin (nouvelles)
/*
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserManagement from "./pages/Admin/UserManagement";
import CourseManagement from "./pages/Admin/CourseManagement";
import EmailManagement from "./pages/Admin/EmailManagement";
*/
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Routes publiques - redirection vers dashboard si connecté */}
          <Route 
            path="/signin" 
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } 
          />

          {/* Routes protégées - accessible seulement aux utilisateurs connectés */}
          <Route 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard principal */}
            <Route index path="/" element={<Home />} />
            
            {/* Pages générales (utilisateurs et admins) */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            
            {/* Formulaires */}
            <Route path="/form-elements" element={<FormElements />} />
            
            {/* Tableaux */}
            <Route path="/basic-tables" element={<BasicTables />} />
            
            {/* Éléments UI */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            
            {/* Graphiques */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
            {/* Prediction page */}

<Route
  path="/form-predict"
  element={
    <PredictionCsvProvider>
      <PredictionPage />
    </PredictionCsvProvider>
  }
/>
<Route
  path="/see-all"
  element={
    <PredictionCsvProvider>
      <SeeAllPage />
    </PredictionCsvProvider>
  }
  />


  <Route
  path="/History/all"
  element={
      <HistoryAll />
  }/>
                          <Route path="/compare-predict" element={<PredictionPageComparaison />} />

             
             <Route path="/see-compare-all" element={<SeeCompareAllPage />} />

            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <HomeAdmin />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Users />
                </ProtectedRoute>
              } 
            />


                        {/* Routes Admin uniquement 

            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/courses" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <CourseManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/emails" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <EmailManagement />
                </ProtectedRoute>
              } 
            />
            */}
          </Route> 

          {/* Route 404 - accessible à tous */}
          <Route path="*" element={<NotFound />} />
        </Routes>
<Toaster
  position="top-center"   // this centers horizontally at the top
  toastOptions={{
    style: {
      marginTop: "80px", // optional: push it a bit lower if you have a navbar
    },
  }}
/>

      </Router>
    </AuthProvider>
  );
}
