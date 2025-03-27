import { useContext } from 'react';
import { AuthContext } from '../App';

// Custom hook to use authentication context throughout the app
export default function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Helper functions for common auth-related operations
export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) {
    return false;
  }
  
  return user.permissions.includes(permission);
};

export const getRole = () => {
  const userData = localStorage.getItem('userData');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return user.role;
  } catch (e) {
    return null;
  }
};

export const getUserName = () => {
  const userData = localStorage.getItem('userData');
  if (!userData) return '';
  
  try {
    const user = JSON.parse(userData);
    return user.name || user.username;
  } catch (e) {
    return '';
  }
};