
const apiBase = "http://185.96.163.183:8000/api/v1";

async function run() {
    console.log("Fetching...");
    const response = await fetch(`${apiBase}/products?limit=100&status=active`);
    const data = await response.json();
    const products = data.items;

    console.log("Total Fetched:", products.length);

    const favorites = products.filter(p => {
        const f = p.metadata?.featured;
        return f === true || f === "true";
    });

    console.log("Favorites Found:", favorites.length);
    if (favorites.length > 0) {
        console.log("Sample Fav:", favorites[0].name);
    }

    const discounted = products.filter(p => {
        const reg = Number(p.regular_price);
        const sale = Number(p.sale_price);
        return reg > 0 && sale > 0 && sale < reg;
    });

    console.log("Discounted Found:", discounted.length);
    if (discounted.length > 0) {
        console.log("Sample Disc:", discounted[0].name, "Sale:", discounted[0].sale_price, "Reg:", discounted[0].regular_price);
    }
}

run();
