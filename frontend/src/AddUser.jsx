import { useState } from 'react';
import axios from 'axios';

export default function AddUser() {
    const [formData, setFormData] = useState({AddFullname: '', AddUsername: '', AddPassword: '', passcode: ''});
    const [errorMessage, setErrorMessage] = useState('');
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleSubmit = async (event) =>{
        event.preventDefault();
        setErrorMessage(''); // Clear previous errors

        const { AddFullname, AddUsername, AddPassword, passcode} = formData;

        try {
            const response = await axios.post('http://localhost:3000/users/addUser', {
                fullname: AddFullname,
                username: AddUsername,
                password: AddPassword,
                passcode: passcode,
            });
            console.log(response.data);

        } catch (error) {
            // Handle login errors (e.g., incorrect credentials)
            setErrorMessage('Creation of user failed. You provided the wrong passcode');
            console.error('Login error:', error);
        }
    };

    return (
        <>
        <h2>Form to add new User:</h2>
        <form onSubmit={handleSubmit}>
            <label htmlFor="addFullname">Full Name</label>
            <input type="text" id="addFullname" name='AddFullname' value={formData.AddFullname} onChange={handleChange} />

            <label htmlFor="addUsername">Username</label>
            <input type="text" id="addUsername" name='AddUsername' value={formData.AddUsername} onChange={handleChange} />

            <label htmlFor="addPassword">Password:</label>
            <input type="password" id="addPassword" name='AddPassword' value={formData.AddPassword} onChange={handleChange} />

            <label htmlFor="passcode">Secret passcode to get acess:</label>
            <input type="password" id="passcode" name='passcode' value={formData.passcode} onChange={handleChange} />
             <button type='submit'>Add User</button>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </form>
        </>
    )
}