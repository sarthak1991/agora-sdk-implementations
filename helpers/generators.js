const TOKEN_SERVER_URL = "https://reactdelhi.com";

const generateUID = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uid = "";
  for (let i = 0; i < 6; i++) {
    uid += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `USR-${uid}`;
};

const generateRTCToken = async (CHANNEL, uid, role) => {
  console.log(`reached here-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-`);
  try {
    let response = await fetch(
      `${TOKEN_SERVER_URL}/rtc/${CHANNEL}/${role}/uid/${uid}`
    );
    let data = await response.json();
    let token = data.rtcToken;
    return token;
  } catch (error) {
    console.log("Error in generating RTC token");
    console.log(error);
  }
};

const generateRTMToken = async (uid) => {
  try {
    let response = await fetch(`${TOKEN_SERVER_URL}/rtm/${uid}/?expiry=600`);
    let data = await response.json();
    let token = data.rtmToken;
    return token;
  } catch (error) {
    console.log("Error in generating RTM token");
    console.log(error);
  }
};

const generate = {
  uid: generateUID,
  rtcToken: generateRTCToken,
  rtmToken: generateRTMToken,
};

export default generate;
