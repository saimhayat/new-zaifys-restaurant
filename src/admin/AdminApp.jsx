import { Navigate, Route, Routes } from "react-router-dom";
import "./admin.css";
import { useAdminSession } from "../store/restaurantStore";
import LoginScreen from "./LoginScreen";
import AdminLayout from "./AdminLayout";
import Dashboard from "./sections/Dashboard";
import Reports from "./sections/Reports";
import Orders from "./sections/Orders";
import Reservations from "./sections/Reservations";
import MenuManager from "./sections/MenuManager";
import Customers from "./sections/Customers";
import Settings from "./sections/Settings";

/**
 * Entry point for `/admin/*`. Loaded lazily so customers never download it.
 * Everything below the gate shares one layout with nested routes.
 */
function AdminApp() {
  const session = useAdminSession();

  if (!session) return <LoginScreen />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="reports" element={<Reports />} />
        <Route path="orders" element={<Orders />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="menu" element={<MenuManager />} />
        <Route path="customers" element={<Customers />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

export default AdminApp;
