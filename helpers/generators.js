import CONSTANTS from "./CONSTS";


// This is my own custom node backend hosting the Agora Token Service. It is secured with SSL (https)

const TOKEN_SERVER_URL = "https://reactdelhi.com";
const local_token_server = "http://localhost:8080"

const generateUID = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uid = "";
  for (let i = 0; i < 6; i++) {
    uid += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `USR-${uid}`;
  // return `527841`
};


const numericUID = () => {

  const randomNineDigitNumber = (Math.floor(Math.random() * 1000000000)).toString();

  return randomNineDigitNumber;
};


// Generate RTC Token
const generateRTCToken = async (CHANNEL, uid, role, expiry = 300) => {
  console.log(`Inside Generate RTC Token`);
  try {
    let response = await fetch(
      `${TOKEN_SERVER_URL}/rtc/${CHANNEL}/${role}/uid/${uid}?expiry=${CONSTANTS.expiry}`
    );
    let data = await response.json();
    let token = data.rtcToken;
    return token;
  } catch (error) {
    console.log("Error in generating RTC token");
    console.log(error);
  }
};

//Generate RTM Token
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

const generateAuthorizationCredentialForCloudRecording = () => {
  

  // DO NOT COMMIT THIS
  // Customer ID
  const customerKey = CONSTANTS.customerID
  
  // Customer secret
  const customerSecret = CONSTANTS.customerSecret
  
  // Concatenate customer key and customer secret and use base64 to encode the concatenated string
  const plainCredential = customerKey + ":" + customerSecret

  console.log(`Plain credential ==> ${plainCredential}`);
  console.log(plainCredential);
  
  // Encode with base64
  const encodedCredential = btoa(plainCredential).toString('base64')
  const authorizationField = "Basic " + encodedCredential

  return authorizationField;

}



// create live stream 

const createLiveStream = async (name, region, APPID, AccessChannel, ImageUID, RTMPUrl, rtcToken, idleTimeout=300) => {
  console.log(`Inside Generate RTC Token`);
  try {
    let response = await fetch(
      `${TOKEN_SERVER_URL}/livestream//${name}/${region}/${APPID}/${AccessChannel}/${ImageUID}/${RTMPUrl}/${rtcToken}/${idleTimeout}`
    );
    let data = await response.json();
    let token = data.rtcToken;
    return token;
  } catch (error) {
    console.log("Error in generating RTC token");
    console.log(error);
  }
};

const instanceID = () => {

  const randomSevenDigitNumber = (Math.floor(Math.random() * 10000000)).toString();

  return randomSevenDigitNumber;
};

// Exporting all the generator functions inside a single variable called generate. Enhances the readability!
const generate = {
  uid: generateUID,
  rtcToken: generateRTCToken,
  rtmToken: generateRTMToken,
  authenticateCloud: generateAuthorizationCredentialForCloudRecording,
  numericUID, 
  createLiveStream, 
  instanceID
};

export default generate;
