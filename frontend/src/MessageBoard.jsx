import axios from 'axios';
// Set token as a default authorization header for all requests
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('jwtToken')}`;


export default function MessageBoard () {

    async function fetchData () {
        try {
            const { data } = await axios.get('http://localhost:3000/users/posts', )
            console.log(data[0]);
        } catch (error) {
            console.error('Error accessing protected route:', error);
        }
    } 
    fetchData();
    return <><div>hello</div></>
}