import $ from "jquery";
import AgoraRTC from "agora-rtc-sdk-ng";
import AgoraRTM from "agora-rtm-sdk";

const APP_ID = "57263a211c2f40a4a3c32d5431f09dcd";
const CHANNEL = "srthk";
const APP_CERTIFICATE = "6aed87b0a44b4e0d9c016a463cceab3b";
const TOKEN_SERVER_URL = "139.59.33.2:8080";

const generateUID = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uid = "";
  for (let i = 0; i < 6; i++) {
    uid += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `USR-${uid}`;
};

let localTracks = [];
let remoteUsers = {};
let UID = "";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
client.enableAudioVolumeIndicator();

let generateRTCToken = async (uid) => {
  // http://localhost:8080/rtc/channel/role/tokenType/uid
  try {
    let response = await fetch(
      `http://139.59.33.2:8080/rtc/${CHANNEL}/publisher/uid/${uid}`
    );
    let data = await response.json();
    let token = data.rtcToken;
    return token;
  } catch (error) {
    console.log("Error in generating RTC token");
    console.log(error);
  }
};

let generateRTMToken = async (uid) => {
  // http://localhost:8080/rtc/channel/role/tokenType/uid
  try {
    let response = await fetch(
      `http://139.59.33.2:8080/rtm/${uid}/?expiry=600`
    );
    let data = await response.json();
    let token = data.rtmToken;
    return token;
  } catch (error) {
    console.log("Error in generating RTM token");
    console.log(error);
  }
};

const init_rtc = async (uid) => {
  let token = await generateRTCToken(uid);

  [UID, localTracks] = await Promise.all([
    // join the channel
    client.join(APP_ID, CHANNEL, token, uid),
    // create local tracks, using microphone and camera
    AgoraRTC.createMicrophoneAndCameraTracks(),
  ]);
  return [UID, localTracks];
};

const init_rtm = async (uid) => {
  let rtmClient = AgoraRTM.createInstance(APP_ID);

  rtmClient.on("ConnectionStateChange", (newState, reason) => {
    console.log(
      "RTM connection state changed to" + newState + "reason:" + reason
    );
  });

  let token = await generateRTMToken(uid);
  await rtmClient.login({ uid, token });
  console.log(`rtm client login successful`);

  let chatChannel = await rtmClient.createChannel(CHANNEL);

  // Join the chat channel
  await chatChannel.join();

  // Listen for messages in the chat channel
  chatChannel.on("ChannelMessage", (message, memberId) => {
    console.log(`Received message from ${memberId}: ${message}`);
    displayChatMessage(memberId, message);
  });

  const displayChatMessage = (memberId, message) => {
    const chatLog = document.getElementById("chat-log");
    const messageElement = document.createElement("div");
    messageElement.textContent = `${memberId}: ${JSON.stringify(message.text)}`;
    chatLog.appendChild(messageElement);
  };

  const sendChatMessage = async () => {
    const chatInput = document.getElementById("chat-input");
    const messageText = chatInput.value.trim();
    if (messageText !== "") {
      try {
        const message = { text: messageText }; // Create a plain object with a 'text' property
        await chatChannel.sendMessage(message);
        chatInput.value = "";
      } catch (error) {
        console.log("Error sending chat message:", error);
      }
    }
  };

  document
    .getElementById("send-btn")
    .addEventListener("click", sendChatMessage);

  return rtmClient;
};

let joinAndDisplayLocalStream = async () => {
  try {
    client.on("user-published", handleUserJoined);

    client.on("user-left", handleUserLeft);

    let uid = generateUID();

    const [UID, localTracks] = await init_rtc(uid);
    const rtmClient = await init_rtm(uid);

    {
    }

    // console.log(`Starter][][][]
    // '
    // '
    // '
    // '
    // '
    // '
    // '
    // `);
    // console.log(rtmClient);
    // console.log(`Starter][][][]
    // '
    // '
    // '
    // '
    // '
    // '
    // '
    // `);

    client.on("volume-indicator", (volumes) => {
      volumes.forEach((volume) => {
        console.log(`UID ${volume.uid} Level ${volume.level}`);
        console.log("check this out");
        const activeSpeakerUid = volume.uid;
        const activeSpeakerLevel = volume.level;

        if (activeSpeakerLevel > 0) {
          const activeSpeakerContainer = $(
            `#user-container-${activeSpeakerUid}`
          );
          console.log("activeSpeakerUid", activeSpeakerUid);
          console.log("activeSpeakerLevel", activeSpeakerLevel);
          console.log("activeSpeakerContainer", activeSpeakerContainer);
          if (activeSpeakerContainer.length > 0) {
            const activeSpeaker = activeSpeakerContainer.find(".video-player");
            if (activeSpeaker.length > 0) {
              activeSpeaker.css("border", "thick solid red");
            }
          }
        } else {
          // Remove highlight from all speakers
          $(".video-player").css("border", "");
        }
      });
    });

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}" style="  height: 50vh; width: 90vw;"></div>
                        <div class="uid-label">owner:${UID}</div>
                  </div>`;
    $("#video-call").append(player);
    document.title = `Owner: ${UID}`;

    localTracks[1].play(`user-${UID}`);

    await client.publish([localTracks[0], localTracks[1]]);
  } catch (err) {
    console.log("There has been an error");
    console.log(err);
  }
};

let joinStream = async () => {
  try {
    console.log("Clicked join stream");
    await joinAndDisplayLocalStream();
    console.log("Have we reached here? ");
    $("#join-btn").hide();
    $("#stream-controls").show();
    $(".stream-control-button").show();
  } catch (error) {
    console.log("There has been an error");
    console.log(error);
  }
};

let handleUserJoined = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  await client.subscribe(user, mediaType);

  if (mediaType === "video") {
    let player = $(`#user-container-${user.uid}`);
    if (player.length > 0) {
      player.remove();
    }

    player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}" style="height: 50vh; width: 90vw;"></div>
                        <div class="uid-label">participant:${user.uid}</div> 
                 </div>`;
    $("#video-call").append(player);
    document.title = `Participant:${user.uid}`;

    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  $(`#user-container-${user.uid}`).remove();
};

let leaveAndRemoveLocalStream = async () => {
  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  await client.leave();
  $("#join-btn").show();
  $("#stream-controls").hide();
  $(".stream-control-button").hide();
  $("#video-call").html("");
};

let toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    $(e.target).text("Mic on");
    $(e.target).css("background-color", "yellowgreen");
  } else {
    await localTracks[0].setMuted(true);
    $(e.target).text("Mic off");
    $(e.target).css("background-color", "#EE4B2B");
  }
};

let toggleCamera = async (e) => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    $(e.target).text("Camera on");
    $(e.target).css("background-color", "yellowgreen");
  } else {
    await localTracks[1].setMuted(true);
    $(e.target).text("Camera off");
    $(e.target).css("background-color", "#EE4B2B");
  }
};

// Add an event listener to the send button

$("#join-btn").on("click", joinStream);
$("#leave-btn").on("click", leaveAndRemoveLocalStream);
$("#mic-btn").on("click", toggleMic);
$("#camera-btn").on("click", toggleCamera);
