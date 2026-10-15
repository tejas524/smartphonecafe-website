import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./AdminAuth.jsx";
import { ToastProvider } from "./ui/Toast.jsx";
import { Spinner } from "./ui/states.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import LazyRoute from "../components/LazyRoute.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ResourcePage from "./pages/ResourcePage.jsx";
import AccessoriesAdmin from "./pages/Accessories.jsx";
import ReviewsAdmin from "./pages/Reviews.jsx";
import BusinessInfo from "./pages/BusinessInfo.jsx";

// Business Analytics pulls in the charting library, so it is code-split and only
// downloaded when the owner actually opens the analytics screen. It is loaded
// through LazyRoute so a blocked/failed chunk shows a retryable error state
// instead of blanking the admin area.
const loadAnalytics = () => import("./pages/Analytics.jsx");

/** Blocks the admin area until the session check resolves. */
function RequireAuth() {
  const { status } = useAdminAuth();
  const location = useLocation();

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 text-white">
        <Spinner size={28} />
      </div>
    );
  }
  if (status === "anon") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route
                path="analytics"
                element={<LazyRoute loader={loadAnalytics} name="Analytics" homeTo="/admin" />}
              />
              <Route path="offers" element={<ResourcePage resource="offers" />} />
              <Route path="smartphones" element={<ResourcePage resource="smartphones" />} />
              <Route path="brands" element={<ResourcePage resource="brands" />} />
              <Route path="repairs" element={<ResourcePage resource="repair-services" title="Repairs" />} />
              <Route path="accessories" element={<AccessoriesAdmin />} />
              <Route path="gallery" element={<ResourcePage resource="gallery" />} />
              <Route path="reviews" element={<ReviewsAdmin />} />
              <Route path="business-info" element={<BusinessInfo />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </ToastProvider>
    </AdminAuthProvider>
  );
}
