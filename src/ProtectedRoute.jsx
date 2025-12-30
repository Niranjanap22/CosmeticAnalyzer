import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, children }) {
  // show loading only while auth status is unknown (undefined)
  if (user === undefined) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}