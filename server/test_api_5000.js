async function testAPI() {
    try {
        const res = await fetch('http://localhost:5000/api/admin/users');
        if (!res.ok) {
            console.error("HTTP Error:", res.status, res.statusText);
        }
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}
testAPI();
