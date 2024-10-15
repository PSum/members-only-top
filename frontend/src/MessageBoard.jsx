export default function MessageBoard ({ posts }) {
    let content;
    try {
    content = posts.map((post) => {
        return (
            <div key={post.id}>
                <div>{post.title}</div>
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
        {content}
        </>
    )
}