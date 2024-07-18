import CONSTANTS from "./CONSTS";
import generate from "./generators";

const bearerToken = generate.authenticateCloud();

const TOKEN_SERVER_URL = "https://reactdelhi.com";
const local_token_server = "http://localhost:8080"

// console.log("this is the bearer token-=-=-=-=-=-=-=-=-=-=");

// console.log(bearerToken);

const fetchResults = async (URL, requestBody, method = CONSTANTS.METHOD) => {
  const body = JSON.stringify(requestBody);

  const options = {
    method,
    headers: {
      Authorization: `${bearerToken}`,
      "Content-Type": "application/json",
    },
    body,
  };

  let dataToReturn = null;
  try {
    const response = await fetch(URL, options);

    dataToReturn = response;
  } catch (error) {
    console.log("There has been an error");
    console.log(error);
    dataToReturn = error;
  }

  return dataToReturn;
};

// ========================== WEB RECORDING BLOCK STARTS ================

export const acquireRecording = async (APPID, AccessChannel, uid) => {
  let acquired = false;

  console.log("Here's everything we need");
  console.log(APPID);
  console.log(AccessChannel);
  console.log(uid);

  const acquireURL = `https://api.agora.io/v1/apps/${APPID}/cloud_recording/acquire`;

  const requestBody = {
    cname: AccessChannel,
    uid,
    clientRequest: {
      resourceExpiredHour: 24,
      scene: 1,
    },
  };

  const response = await fetchResults(acquireURL, requestBody);

  const data = await response.json();

  console.log("data==> ", data);

  acquired = response.status == 200 ? true : false;

  console.log("acquired==> ", acquired);
  return data;
};

export const startWebRecording = async (
  APPID,
  resourceID,
  cname,
  uid,
  rtcToken,
  mode = "web"
) => {
  const webRecordingUrl = `https://api.agora.io/v1/apps/${APPID}/cloud_recording/resourceid/${resourceID}/mode/${mode}/start`;

  const requestBody = {
    cname,
    uid,
    clientRequest: {
      token: rtcToken,
      extensionServiceConfig: {
        errorHandlePolicy: "error_abort",
        extensionServices: [
          {
            serviceName: "web_recorder_service",
            errorHandlePolicy: "error_abort",
            serviceParam: {
              url: "https://agora-augustdemo-bysarthak.netlify.app/",
              audioProfile: 0,
              videoWidth: 1280,
              videoHeight: 720,
              maxRecordingHour: 72,
            },
          },
        ],
      },
      recordingFileConfig: {
        avFileType: ["hls", "mp4"],
      },
      storageConfig: {
        vendor: 2,
        region: 7,
        bucket: "agoracloudrecordingdemo",
        accessKey: "SAKIA6GBMGYVGU2TPYZHNNO",
        secretKey: "BmByDu4t3/mxxvheOLlhO0BDkKmQxYBPoxMyIXtKdNO",
      },
    },
  };

  console.log("recording requestBody => ", requestBody);

  // do NOT uncomment lines 1-5 until you are ready to record.

  const response = await fetchResults(webRecordingUrl, requestBody);

  const data = await response.json();

  console.log("data==> ", data);

  console.log(
    "recording has started?==> ",
    response.status == 200 ? true : false
  );
  return data;

  //   function ends here
};

export const stopWebRecording = async (
  APPID,
  resourceId,
  sid,
  AccessChannel,
  RecordingUID,
  mode = "web"
) => {
  const stopWebRecordingUrl = `https://api.agora.io/v1/apps/${APPID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/${mode}/stop`;

  const requestBody = {
    cname: AccessChannel,
    uid: RecordingUID,
    clientRequest: {},
  };

  console.log("stop recording requestBody => ", requestBody);
  // do NOT uncomment lines 1-5 until you are ready to record.

  const response = await fetchResults(stopWebRecordingUrl, requestBody);

  const data = await response.json();

  console.log("data==> ", data);

  console.log(
    "recording has stopped?==> ",
    response.status == 200 ? true : false
  );
  return data;
};



// ========================== WEB RECORDING BLOCK ENDS =================

// ========================== MEDIA PUSH BLOCK START ================

export const createRtmpConverter = async (
  name,
  region,
  APPID,
  AccessChannel,
  ImageUID,
  RTMPUrl,
  rtcToken,
  idleTimeout = 300
) => {
  const requestBody = {
    converter: {
      name,
      transcodeOptions: {
        rtcChannel: AccessChannel,
        token: rtcToken,
        audioOptions: {
          codecProfile: "LC-AAC",
          sampleRate: 48000,
          bitrate: 48,
          audioChannels: 1,
        },
        videoOptions: {
          canvas: {
            width: 1280,
            height: 720,
          },
          layout: [
            {
              rtcStreamUid: ImageUID,
              region: {
                xPos: 0,
                yPos: 0,
                zIndex: 1,
                width: 640,
                height: 720,
              },
              fillMode: "fill",
              placeholderImageUrl:
                "http://example.agora.io/host_placeholder.jpg",
            },
          ],
          codecProfile: "main",
          frameRate: 30,
          gop: 60,
          bitrate: 2500,
        },
      },
      rtmpUrl: RTMPUrl,
      idleTimeOut: idleTimeout,
    },
    region: CONSTANTS.rtmpRegion,
    APPID: CONSTANTS.APPID,
  };

  console.log("Request Body for RTMP Converter");
  console.log(requestBody);

  // let urlForCreateStream =

  try {
    const response = await fetch(`${TOKEN_SERVER_URL}/createLiveStream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data = await response.json();

    // console.log("RTMP converter created-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=>>>>>>>>>>>>>>>>>>>>>>>>>", data);
    return data;
  } catch (error) {
    console.error("Error creating RTMP converter:", error);
    throw error;
  }
};

// const getRtmpConverter = async (region, APPID, id) => {
//   const url = `https://api.agora.io/${region}/v1/projects/${APPID}/rtmp-converters/${id}`;

//   try {
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });

//     const data = await response.json();
//     console.log("RTMP Converter details:", data);
//     return data;
//   } catch (error) {
//     console.error("Error fetching RTMP Converter details:", error);
//     throw error;
//   }
// };

// const listRtmpConverters = async (APPID) => {
//   const url = `https://api.agora.io/v1/projects/${APPID}/rtmp-converters`;

//   try {
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });

//     const data = await response.json();
//     console.log("RTMP Converters list:", data);
//     return data;
//   } catch (error) {
//     console.error("Error fetching RTMP Converters list:", error);
//     throw error;
//   }
// };

export const deleteRtmpConverter = async (region, APPID, id) => {
  const requestBody = { id };

  console.log(
    "+__+_+_+_+_+_+_+_+_+DAta from stream create=====----+__+_+_+_+_+_"
  );
  console.log(id);

  try {
    const response = await fetch(`${TOKEN_SERVER_URL}/deleteLiveStream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // If the server returns no content, just return a success message
    if (response.status === 204) {
      return { message: "RTMP converter deleted successfully" };
    }

    // If the server returns content, parse and return it
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting RTMP converter:", error);
    throw error;
  }
};

// ========================== MEDIA PUSH BLOCK END ==================

// ========================== MEDIA PULL BLOCK START ==================

export const createCloudPlayer = async (region, APPID, InjectUrl, AccessChannel, CloudPlayerUID, token, idleTimeout) => {
  console.log("HIIIIII from inside create cloud player ie media pull");
  
  const requestBody = {
    player: {
      streamUrl: InjectUrl,
      channelName: AccessChannel,
      token,
      uid: CloudPlayerUID,
      // account: "CloudPlayerStringUid", // Uncomment if needed
      idleTimeout: idleTimeout,
      name: generate.uid()
    }
  };

  console.log(requestBody);

  try {
    const response = await fetch(`${TOKEN_SERVER_URL}/createMediaPull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating cloud player:", error);
    throw error;
  }
};

export const deleteCloudPlayer = async (region, APPID, id) => {

  const requestBody = { id };

  console.log(
    "+__+_+_+_+_+_+_+_+_+DAta from stream create=====----+__+_+_+_+_+_"
  );
  console.log(id);

  try {
    const response = await fetch(`${TOKEN_SERVER_URL}/deleteMediaPull`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // If the server returns no content, just return a success message
    if (response.status === 204) {
      return { message: "RTMP converter deleted successfully" };
    }

    // If the server returns content, parse and return it
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting RTMP converter:", error);
    throw error;
  }
};

// const listCloudPlayers = async (APPID) => {
//   const url = `https://api.agora.io/v1/projects/${APPID}/cloud-player/players`;

//   try {
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (response.ok) {
//       const data = await response.json();
//       console.log("Cloud Players list:", data);
//       return data;
//     } else {
//       const errorData = await response.json();
//       console.error("Error fetching Cloud Players list:", errorData);
//       return null;
//     }
//   } catch (error) {
//     console.error("Error fetching Cloud Players list:", error);
//     throw error;
//   }
// };


// ========================== MEDIA PULL BLOCK END ====================

