
const apiBase = "https://ehankki.fi:8443";

async function testFetch() {
  console.log("Fetching from:", apiBase);
  try {
    const response = await fetch(`${apiBase}/products`);
    console.log("Status:", response.status);
    if (!response.ok) {
        console.error("Failed");
        return;
    }
    const data = await response.json();
    console.log("Data type:", typeof data);
    console.log("Is Array:", Array.isArray(data));
    if (Array.isArray(data) && data.length > 0) {
        console.log("First item:", data[0]);
        if (Array.isArray(data[0])) {
            console.log("First item content (parsed):", JSON.parse(data[0][0]));
        }
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

testFetch();
