import CONSTANTS from "./CONSTS";
import generate from "./generators";

const bearerToken = generate.authenticateCloud();

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


const acquireRecording = async (APPID, AccessChannel, uid) => {
  let acquired = false;

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

const startWebRecording = async (
  APPID,
  resourceID,
  cname,
  uid,
  rtcToken,
  mode = "web"
) => {
  const webRecordingUrl = `https://api.agora.io/v1/apps/${{
    APPID,
  }}/cloud_recording/resourceid/${{ resourceID }}/mode/${{ mode }}/start`;

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
              url: "https://agoratest-sb1991.netlify.app/",
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
        accessKey: "AKIA6GBMGYVGU2TPYZHN",
        secretKey: "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",
      },
    },
  };

console.log("recording requestBody => ", );


//   function ends here
};

const stopWebRecording = async () => {
    const stopWebRecordingUrl = `https://api.agora.io/v1/apps/${{APPID}}/cloud_recording/resourceid/${{resourceId}}/sid/${{sid}}/mode/${{mode}}/stop`

    const requestBody = {
        cname: AccessChannel,
        uid: RecordingUID,
        clientRequest: {}
    }
}

const recording = {
  acquire: acquireRecording,
  startWebRecording,
  stopWebRecording
};



// ========================== WEB RECORDING BLOCK ENDS =================


// ========================== MEDIA PUSH BLOCK START ================


const createRtmpConverter = async (region, APPID, AccessChannel, ImageUID, rtcUid, RTMPUrl, idleTimeout) => {
  const url = `https://api.agora.io/${region}/v1/projects/${APPID}/rtmp-converters`;

  const requestBody = {
    converter: {
      name: "test",
      transcodeOptions: {
        rtcChannel: AccessChannel,
        token: "",
        audioOptions: {
          codecProfile: "LC-AAC",
          sampleRate: 48000,
          bitrate: 48,
          audioChannels: 1
        },
        videoOptions: {
          canvas: {
            width: 960,
            height: 720
          },
          layout: [
            {
              rtcStreamUid: ImageUID,
              region: {
                xPos: 0,
                yPos: 0,
                zIndex: 1,
                width: 480,
                height: 720
              },
              fillMode: "fill",
              placeholderImageUrl: "http://example.agora.io/host_placeholder.jpg"
            },
            {
              rtcStreamUid: rtcUid,
              region: {
                xPos: 480,
                yPos: 0,
                zIndex: 1,
                width: 480,
                height: 720
              }
            }
          ],
          codecProfile: "main",
          frameRate: 15,
          gop: 30,
          bitrate: 910
        }
      },
      rtmpUrl: RTMPUrl,
      idleTimeOut: idleTimeout
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': ''
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log("RTMP Converter creation response:", data);
    return data;
  } catch (error) {
    console.error("Error creating RTMP Converter:", error);
    throw error;
  }
};

const getRtmpConverter = async (region, APPID, id) => {
  const url = `https://api.agora.io/${region}/v1/projects/${APPID}/rtmp-converters/${id}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log("RTMP Converter details:", data);
    return data;
  } catch (error) {
    console.error("Error fetching RTMP Converter details:", error);
    throw error;
  }
};

const listRtmpConverters = async (APPID) => {
  const url = `https://api.agora.io/v1/projects/${APPID}/rtmp-converters`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log("RTMP Converters list:", data);
    return data;
  } catch (error) {
    console.error("Error fetching RTMP Converters list:", error);
    throw error;
  }
};

const deleteRtmpConverter = async (region, APPID, id) => {
  const url = `https://api.agora.io/${region}/v1/projects/${APPID}/rtmp-converters/${id}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log("RTMP Converter deleted successfully");
      return true;
    } else {
      const errorData = await response.json();
      console.error("Error deleting RTMP Converter:", errorData);
      return false;
    }
  } catch (error) {
    console.error("Error deleting RTMP Converter:", error);
    throw error;
  }
};

const mediaPush = {
  create: createRtmpConverter,
  getStatus:getRtmpConverter,
  list: listRtmpConverters,
  delete: deleteRtmpConverter

}



// ========================== MEDIA PUSH BLOCK END ==================


// ========================== MEDIA PULL BLOCK START ==================


const createCloudPlayer = async (region, APPID, InjectUrl, AccessChannel, CloudPlayerUID, idleTimeout = 300) => {
  const url = `https://api.agora.io/${region}/v1/projects/${APPID}/cloud-player/players`;

  const requestBody = {
    player: {
      streamUrl: InjectUrl,
      channelName: AccessChannel,
      token: "",
      uid: CloudPlayerUID,
      // account: CloudPlayerStringUid, // Uncomment if needed
      idleTimeout: idleTimeout,
      name: "test"
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log("Cloud Player creation response:", data);
    return data;
  } catch (error) {
    console.error("Error creating Cloud Player:", error);
    throw error;
  }
};

const deleteCloudPlayer = async (region, APPID, id) => {
  const url = `https://api.agora.io/${region}/v1/projects/${APPID}/cloud-player/players/${id}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log("Cloud Player deleted successfully");
      return true;
    } else {
      const errorData = await response.json();
      console.error("Error deleting Cloud Player:", errorData);
      return false;
    }
  } catch (error) {
    console.error("Error deleting Cloud Player:", error);
    throw error;
  }
};

const listCloudPlayers = async (APPID) => {
  const url = `https://api.agora.io/v1/projects/${APPID}/cloud-player/players`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Cloud Players list:", data);
      return data;
    } else {
      const errorData = await response.json();
      console.error("Error fetching Cloud Players list:", errorData);
      return null;
    }
  } catch (error) {
    console.error("Error fetching Cloud Players list:", error);
    throw error;
  }
};

const mediaPull = {
  create: createCloudPlayer,
  delete: deleteCloudPlayer,
  list: listCloudPlayers
}


// ========================== MEDIA PULL BLOCK END ====================



export default recording;
