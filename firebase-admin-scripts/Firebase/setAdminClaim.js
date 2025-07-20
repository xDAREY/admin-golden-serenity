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
    
    
    // Verify
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    
  } catch (error) {
  }
  
  process.exit(0);
}

setAdminClaim();