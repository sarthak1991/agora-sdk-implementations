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


//   function ends here
};

const stopWebRecording = async () => {
    const stopWebRecordingUrl = `https://api.agora.io/v1/apps/${{APPID}}/cloud_recording/resourceid/${{resourceId}}/sid/${{sid}}/mode/${{mode}}/stop`

    const requestBody = {
        "cname": "{{AccessChannel}}",
        "uid": "{{RecordingUID}}",
        "clientRequest": {}
    }
}

const recording = {
  acquire: acquireRecording,
  web: startWebRecording,
};

export default recording;
