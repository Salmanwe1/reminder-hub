import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children, roleRequired }) {
  const { user, role } = useAuth();

  // If the user is not logged in, redirect to login
  if (!user) return <Navigate to="/login" />;

  // If the user's role doesn't match the required role, redirect to their default dashboard
  if (role !== roleRequired) {
    return <Navigate to={`/${role}-dashboard`} />;
  }

  // If all checks pass, render the children
  return children;
}

export default PrivateRoute;
