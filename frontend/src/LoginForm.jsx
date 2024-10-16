import { useState } from 'react';
import axios from 'axios';

export default function LoginForm({ fetchData }) {
    const [formData, setFormData] = useState({username: '', password: ''});
    const [errorMessage, setErrorMessage] = useState('');
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleSubmit = async (event) =>{
        event.preventDefault();
        setErrorMessage(''); // Clear previous errors

        const { username, password } = formData;

        try {
            const response = await axios.post('http://localhost:3000/auth/login', {
                username: username,
                password: password,
            });

            const token = response.data.token;

            // Store JWT in local storage
            localStorage.setItem('jwtToken', token);

            // Update header with new token so fetchData() can fetch the data for the messageBoard
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            fetchData();

            // Optionally, redirect the user to another page
            // window.location.href = '/dashboard'; // for example

        } catch (error) {
            // Handle login errors (e.g., incorrect credentials)
            setErrorMessage('Login failed. Please check your username and password.');
            console.error('Login error:', error);
        }
    };

    return (
        <>
        <h2>Login From:</h2>
        <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name='username' value={formData.username} onChange={handleChange} />

            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name='password' value={formData.password} onChange={handleChange} />
             <button type='submit'>Login</button>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </form>
        </>
    )
}