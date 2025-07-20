const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim() {
  try {
    // CHANGE THIS TO YOUR EMAIL!
    const userEmail = "anu@golden.org";
    
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    
    console.log(`✅ Admin claim set for: ${userEmail}`);
    
    // Verify
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log("Custom claims:", updatedUser.customClaims);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
  
  process.exit(0);
}

setAdminClaim();