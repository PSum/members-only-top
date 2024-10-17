import { useState, useEffect } from 'react'
import './App.css'
import LoginForm from './LoginForm';
import MessageBoard from './MessageBoard';
import AddUser from './AddUser';
import axios from 'axios';
// Set token as a default authorization header for all requests
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('jwtToken')}`;

function App() {
  const [posts, setPosts] = useState([]);

    async function fetchData () {
        try {
            const { data } = await axios.get('http://localhost:3000/users/posts', )
            setPosts(data);
            console.log('Data fetched succesfull')
        } catch (error) {
            console.error('Error accessing protected route:', error);
        }
    } 

    useEffect(() => {
      fetchData();
    }, [])

  return (
    <>
    <AddUser fetchData={fetchData}></AddUser>
    <LoginForm fetchData={fetchData}></LoginForm>
    <MessageBoard fetchData={fetchData} posts={posts}></MessageBoard>
    </>
  )
}

export default App
