import $ from "jquery";
import AgoraRTC from "agora-rtc-sdk-ng";
import AgoraRTM from "agora-rtm-sdk";
import { generateUID } from "./helpers/generateUID";

const APP_ID = "57263a211c2f40a4a3c32d5431f09dcd";
const CHANNEL = "srthk";
const APP_CERTIFICATE = "6aed87b0a44b4e0d9c016a463cceab3b";
const TOKEN_SERVER_URL = "139.59.33.2:8080";
const APP_TOKEN =
  "007eJxTYMg/1/R6R8vTMw6hn5pWbZc0vu355+oOm+rri5/t2XbBveaEAoOpuZGZcaKRoWGyUZqJQaJJonGysVGKqYmxYZqBZUpyiqOcVVpDICPDOt2PzIwMEAjiszIUF5VkZDMwAACiIiM9";

let localTracks = [];
let remoteUsers = {};
let UID = "";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
client.enableAudioVolumeIndicator();

let generateRTCToken = async (uid, role) => {
  console.log(`reached here-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-`);
  try {
    let response = await fetch(
      `https://reactdelhi.com/rtc/${CHANNEL}/${role}/uid/${uid}`
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
  // // http://localhost:8080/rtc/channel/role/tokenType/uid
  try {
    let response = await fetch(`https://reactdelhi.com/rtm/${uid}/?expiry=600`);
    let data = await response.json();
    let token = data.rtmToken;
    return token;
  } catch (error) {
    console.log("Error in generating RTM token");
    console.log(error);
  }
};

const init_rtc = async (uid, token) => {
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

let joinAndDisplayLocalStream = async (uid, token) => {
  try {
    client.on("user-published", handleUserJoined);

    client.on("user-left", handleUserLeft);

    const [UID, localTracks] = await init_rtc(uid, token);
    await init_rtm(uid);

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
              activeSpeaker.css("border", "thick solid yellow");
            }
          }
        } else {
          // Remove highlight from all speakers
          $(".video-player").css("border", "");
        }
      });
    });

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                        <div class="uid-label">${UID}</div>
                  </div>`;
    $("#video-call").append(player);
    document.title = `${UID}`;

    localTracks[1].play(`user-${UID}`);

    await client.publish([localTracks[0], localTracks[1]]);
  } catch (err) {
    console.log("There has been an error");
    console.log(err);
  }
};

let joinStream = async (role) => {
  try {
    let uid = generateUID();
    let rtcToken = await generateRTCToken(uid, role);

    console.log("Clicked join stream");
    await joinAndDisplayLocalStream(uid, rtcToken);
    console.log("Have we reached here? ");
    $("#chat-container").show();
    $("#stream-controls").show();
    $("#stream-join-buttons").hide();
    $(".layout-btn").show();
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
                        <div class="video-player" id="user-${user.uid}"></div>
                        <div class="uid-label">${user.uid}</div> 
                 </div>`;
    $("#video-call").append(player);
    document.title = `${user.uid}`;

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
  $("#chat-container").hide();
  $("#stream-controls").hide();
  $("#stream-join-buttons").show();
  $(".layout-btn").hide();
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

$("#join-as-host-btn").on("click", async () => {
  await joinStream("publisher");
});

$("#join-as-audience-btn").on("click", async () => {
  await joinStream("audience");
});
