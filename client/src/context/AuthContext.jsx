import { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

export const AuthContext = createContext();

const initialState = {
    user: null,
    token: sessionStorage.getItem('token'),
    isAuthenticated: !!sessionStorage.getItem('token'),
    loading: true,
    role: sessionStorage.getItem('role') || null,
    requiresPasswordChange: sessionStorage.getItem('requiresPasswordChange') === 'true'
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'USER_LOADED':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload,
                role: action.payload.role
            };
        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            sessionStorage.setItem('token', action.payload.token);
            sessionStorage.setItem('role', action.payload.user.role);
            if (action.payload.user.requiresPasswordChange) {
                sessionStorage.setItem('requiresPasswordChange', 'true');
            } else {
                sessionStorage.removeItem('requiresPasswordChange');
            }
            return {
                ...state,
                token: action.payload.token,
                user: action.payload.user,
                isAuthenticated: true,
                loading: false,
                role: action.payload.user.role,
                requiresPasswordChange: action.payload.user.requiresPasswordChange || false
            };
        case 'AUTH_ERROR':
        case 'LOGIN_FAIL':
        case 'LOGOUT':
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('role');
            sessionStorage.removeItem('requiresPasswordChange');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
                role: null,
                requiresPasswordChange: false
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const loadUser = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            dispatch({ type: 'AUTH_ERROR' });
            return;
        }

        const config = {
            headers: {
                'x-auth-token': token
            }
        };

        try {
            const res = await axios.get(`${API_BASE_URL}/api/auth`, config);
            dispatch({
                type: 'USER_LOADED',
                payload: res.data
            });
        } catch (err) {
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (email, password) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const body = JSON.stringify({ email, password });

        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, body, config);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data
            });
        } catch (err) {
            dispatch({
                type: 'LOGIN_FAIL'
            });
            console.error(err);
            const errorMessage = err.response?.data?.msg || err.message || 'Login failed';
            alert(errorMessage);
        }
    };

    const register = async (userData) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/register`, userData, config);
            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: res.data
            });
        } catch (err) {
            dispatch({
                type: 'AUTH_ERROR'
            });
            console.error(err.response.data);
            alert(err.response.data.msg);
        }
    }

    const logout = () => dispatch({ type: 'LOGOUT' });

    return (
        <AuthContext.Provider value={{
            token: state.token,
            isAuthenticated: state.isAuthenticated,
            loading: state.loading,
            user: state.user,
            role: state.role,
            requiresPasswordChange: state.requiresPasswordChange,
            login,
            register,
            logout,
            loadUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};
