const fs = require('fs');

// 1. FILL IN YOUR DETAILS HERE
const myDetails = {
  email: "CB.SC.U4CSE23253@cb.students.amrita.edu",
  name: "Yoganand S",
  mobileNo: "7676243109",
  githubUsername: "Yoganand212",
  rollNo: "CB.SC.U4CSE23253",
  accessCode: "PTBMmQ"
};

// 2. IF YOU ALREADY REGISTERED BEFORE, PASTE YOUR ID AND SECRET HERE
// (If you haven't registered yet, leave these blank!)
const savedClientID = "";
const savedClientSecret = "";

async function getToken() {
  let clientID = savedClientID;
  let clientSecret = savedClientSecret;

  if (!clientID || !clientSecret) {
    console.log("Registering to get clientID and clientSecret...");
    try {
      const res = await fetch("http://20.207.122.201/evaluation-service/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(myDetails)
      });
      const data = await res.json();
      
      if (data.clientID) {
        clientID = data.clientID;
        clientSecret = data.clientSecret;
        console.log("\n!!! IMPORTANT: SAVE THESE FOREVER !!!");
        console.log("clientID:", clientID);
        console.log("clientSecret:", clientSecret);
        console.log("-------------------------------------\n");
      } else {
        console.error("Registration failed (You might have already registered!):", data);
        console.log("If you already registered, you MUST use the clientID and clientSecret you got the first time.");
        return;
      }
    } catch(e) {
      console.error("Registration error:", e);
      return;
    }
  }

  console.log("Authenticating to get access_token...");
  try {
    const authBody = {
      email: myDetails.email,
      name: myDetails.name,
      rollNo: myDetails.rollNo,
      accessCode: myDetails.accessCode,
      clientID: clientID,
      clientSecret: clientSecret
    };

    const res2 = await fetch("http://20.207.122.201/evaluation-service/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authBody)
    });
    const data2 = await res2.json();
    
    if (data2.access_token) {
      console.log("\nSUCCESS! Your Access Token is:");
      console.log(data2.access_token);
      
      // Save to .env
      fs.writeFileSync('.env', `TOKEN=${data2.access_token}\n`);
      console.log("\nToken automatically saved to .env file! You can now run your apps.");
    } else {
      console.error("Auth failed:", data2);
    }
  } catch(e) {
    console.error("Auth error:", e);
  }
}

getToken();
