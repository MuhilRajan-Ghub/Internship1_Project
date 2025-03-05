import { useState } from 'react';
import AdminPage from './components/AdminPage.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/assets/Mobile login-rafiki.png';
import Logo from './components/assets/logo.png';
import './styles.css';

function App() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        console.log('Login submitted:', { username, password });

        // Simulating API call to check credentials
        try {
            const response = await fetch('http://localhost:8081/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            console.log('Login response:', response);

            if (response.ok) {
                setLoggedIn(true);
                toast.info("Successfully Logged in!");
            } else {
                const data = await response.json();
                console.log('Login error:', data);
                toast.error(data.message);
            }
        } catch (error) {
            console.log('Error:', error);
            toast.error("An Error Occurred. Please Try Again Later!");
        }
    };

    return (
        <div className="app-container">
            <ToastContainer/>
            {!loggedIn ? (
                <div>
                    <header className="header">
                        <img src={Logo} alt="Logo" className="logo" />
                    </header>
                    <div className="email-list-container">
                        <div className="email-list-image">
                            <img src={Login} alt="Login" />
                        </div>
                        <div className="email-article">
                            <form onSubmit={handleLogin} className="center-form">
                                <div>
                                    <label htmlFor="username"><b>Username:</b></label>
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password"><b>Password:</b></label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                <div className="center-button">
                                    <button type="submit" className="login-button">
                                        Login
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <AdminPage />
            )}
        </div>
    );
}

export default App;
