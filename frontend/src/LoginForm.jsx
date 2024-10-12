import { useState } from 'react';

export default function LoginForm() {
    const [formData, setFormData] = useState({username: '', password: ''});
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleSubmit = async (event) =>{
        event.preventDefault();
        // do something here
        console.log(formData.username + formData.password)
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name='username' value={formData.username} onChange={handleChange} />

            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name='password' value={formData.password} onChange={handleChange} />
             <button type='submit'>Login</button>
        </form>
    )
}