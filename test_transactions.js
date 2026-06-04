

async function testTransactionsAPI() {
    console.log("Running transaction API tests...");
    const API_URL = 'http://localhost:5000/api/transactions';
    const TEST_USER_ID = '00000000-0000-0000-0000-000000000000'; // Mock dev user

    try {
        console.log("1. Creating a transaction...");
        const postRes = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: TEST_USER_ID,
                amount: 150,
                merchant: 'Test Merchant',
                category: 'food',
                date: new Date().toISOString()
            })
        });

        if (!postRes.ok) {
            const err = await postRes.text();
            throw new Error(`Failed to create: ${postRes.status} ${err}`);
        }
        
        const created = await postRes.json();
        console.log("   Successfully created:", created);

        console.log("\n2. Fetching transactions...");
        const getRes = await fetch(`${API_URL}?userId=${TEST_USER_ID}`);
        if (!getRes.ok) throw new Error("Failed to fetch");
        const list = await getRes.json();
        console.log(`   Fetched ${list.length} transactions. Latest:`, list[0]);

        console.log("\n3. Deleting the transaction...");
        const delRes = await fetch(`${API_URL}/${created.id}?userId=${TEST_USER_ID}`, { method: 'DELETE' });
        if (!delRes.ok) {
            const err = await delRes.text();
            throw new Error(`Failed to delete: ${delRes.status} ${err}`);
        }
        console.log("   Successfully deleted.");
        
        console.log("\n✅ All tests passed!");
    } catch (e) {
        console.error("❌ Test failed:", e.message);
    }
}

testTransactionsAPI();
