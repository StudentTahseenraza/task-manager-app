import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import '../index.css';
export default function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}