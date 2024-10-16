import { useEffect } from 'react';

export default function MessageBoard ({ fetchData, posts }) {
    let content;


    try {
    content = posts.map((post) => {
        return (
            <div key={post.id}>
                <h3>{post.title}</h3>
                <div>{post.message}</div>
                <div>{post.username}</div>
            </div>
        )
    })
} catch (err) {
    console.log(err);
}
    return (
        <>
        <h2>Posts</h2>
        {content}
        </>
    )
}