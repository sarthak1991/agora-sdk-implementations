// GOTO: Bottom of the paage to see Step 1 and start reading the code.
// Used Jquery to make writing code quicker and more readable
import $ from "jquery";

// Importing Agora SDKs
import AgoraRTC from "agora-rtc-sdk-ng";
import AgoraRTM from "agora-rtm-sdk";

import { AIDenoiserExtension } from "agora-extension-ai-denoiser";
import VirtualBackgroundExtension from "agora-extension-virtual-background";



// Importing Generator function to Generate the UID and RTC Token
import generate from "./helpers/generators";

const APP_ID = "57263a211c2f40a4a3c32d5431f09dcd";
// eac91002da8b4caabfdde1753ad8dd90

// Later: It wasn't in the requirements but allow user to enter his channel of choice as we are using cutom tokens using our own token generator serviced by our own HTTPS Enabled NodeJS Server.
const CHANNEL = "srthk";

// placeholder variables
let localTracks = [];
let remoteUsers = {};
let UID = "";

/** 
 * Step 0
 * - Create RTC Client
 * - Enable Volume Indicators from the client (Used in checking for active speaker)
 */
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
// const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });




// Example of geo-restricting the app.
AgoraRTC.setArea("ASIA");


client.enableAudioVolumeIndicator();

/**
 * Step 3.1:
 * - Connect the client to the call
 * - Create Audio and Video tracks
 */

const init_rtc = async (uid, token) => {
  [UID, localTracks] = await Promise.all([
    // join the channel
    client.join(APP_ID, CHANNEL, token, uid),
    // create local tracks, using microphone and camera
    AgoraRTC.createMicrophoneAndCameraTracks(),
  ]);
  return [UID, localTracks];
};

/**
 * Step 3.2:
 * Initialize the signaling SDK
 * - Login to sdk
 * - Create chat channel
 * - Join chat channel
 * - Handle user cases
 */
const init_rtm = async (uid) => {
  let rtmClient = AgoraRTM.createInstance(APP_ID);

  rtmClient.on("ConnectionStateChange", (newState, reason) => {
    console.log(
      "RTM connection state changed to" + newState + "reason:" + reason
    );
  });

  let token = await generate.rtmToken(uid);
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
/**
 *
 * Step 3:
 * - Write logic for when a user joins video call.
 * - Handle user published and user left cases
 * - initialize RTC and RTM SDKs and handle user events for both
 * - Check if the user volume level is above 10. If it is, highlight the user with a yellow border.
 * - Next Steps: --> Check Step 3.1 (init_rtc) and Step 3.2 (init_rtm)
 */
let joinAndDisplayLocalStream = async (uid, token) => {
  try {
    client.on("user-published", handleUserJoined);

    client.on("user-left", handleUserLeft);



    const [UID, localTracks] = await init_rtc(uid, token);
    console.log(`This is the local tracks-=-=-=-=-`);
    console.log(localTracks);
    console.log(`This is the local tracks-=-=-=-=-`);
    await init_rtm(uid);

    // TEST-=-=-=-=-=-=-=-=-=-DENOISER START-=-=-=-=-=-=-=-=-=-=-=-=-

    console.log(`TEST-=-=-=-=-=-=-=-=-=-DENOISER-=-=-=-=-=-=-=-=-=-=-=-=-`);

    const denoiser = new AIDenoiserExtension({ assetsPath: './node_modules/agora-extension-ai-denoiser/external' });



    // Register the extension
    AgoraRTC.registerExtensions([denoiser]);
    // (Optional) Listen for the callback reporting that the Wasm files fail to load


    // Create a processor
const denoiserProcessor = denoiser.createProcessor({
  wasmValidation: false,
});
// Enable the extension by default
denoiserProcessor.enable();

localTracks[0].pipe(denoiserProcessor).pipe(localTracks[0].processorDestination);
await denoiserProcessor.enable();

    // TEST-=-=-=-=-=-=-=-=-=-DENOISER END -=-=-=-=-=-=-=-=-=-=-=-=-




    // VIDEO BLUR START -----------================-------------=============---------==========---------========------=====


    let cloudToken = generate.authenticateCloud()

    // console.log(`CLOUD TOKEN START-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====`);

    // console.log(cloudToken);
    // console.log(`CLOUD TOKEN END-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====`);

    const extension = new VirtualBackgroundExtension();
if (!extension.checkCompatibility()) {
  // The current browser does not support the virtual background plugin, you can stop executing the subsequent logic
  console.error("Does not support Virtual Background!");
}
// Register plugin
AgoraRTC.registerExtensions([extension]);

const processor = extension.createProcessor();


await processor.init();

// localTracks[1].pipe(processor).pipe(localTracks[1].processorDestination);
localTracks[1].pipe(processor).pipe(localTracks[1].processorDestination);


// processor.setOptions({type: 'blur', blurDegree: 2});
processor.setOptions({type: 'color', color: '#00ff00'});


await processor.enable();



    // VIDEO BLUR END -----------================-------------=============---------==========---------========------=====

    client.on("volume-indicator", (volumes) => {
      volumes.forEach((volume) => {
        // console.log(`UID ${volume.uid} Level ${volume.level}`);
        // console.log("check this out");
        const activeSpeakerUid = volume.uid;

        console.log(`uid --> ${volume.uid}`);
        const activeSpeakerLevel = volume.level;

        if (activeSpeakerLevel > 10) {
          const activeSpeakerContainer = $(
            `#user-container-${activeSpeakerUid}`
          );
          // console.log("activeSpeakerUid", activeSpeakerUid);
          // console.log("activeSpeakerLevel", activeSpeakerLevel);
          // console.log("activeSpeakerContainer", activeSpeakerContainer);
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

    localTracks[1].play(`user-${UID}`);

    await client.publish([localTracks[0], localTracks[1]]);
  } catch (err) {
    console.log("There has been an error");
    console.log(err);
  }
};
/**
 *
 * Step 2:
 * - Join Stream.
 * - Handle hiding and showing HTML elements and buttons as appropriate
 * - Next Step -> joinAndDisplayLocalStream
 *
 */
let joinStream = async (role) => {
  try {
    // generate UID and RTC token using custom logic written in ./helpers.generators.js | Split the logic into a different file to keep this file lean
    let uid = generate.uid();
    let rtcToken = await generate.rtcToken(CHANNEL, uid, role);

    console.log(`RTC TOKEN END-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====`);
    console.log(rtcToken);
    console.log("UID");
    console.log(uid);
    console.log(`RTC TOKEN END-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====-----------================-------------=============---------==========---------========------=====`);

    console.log("Clicked join stream");

    await joinAndDisplayLocalStream(uid, rtcToken);

    console.log("Have we reached here? ");
    $("#chat-container").show();
    $("#stream-controls").show();
    $("#stream-join-buttons").hide();
    $("#stream-button-container").css("display", "none");
    $(".layout-btn").css("display", "block");
    $("#video-call-container").show();
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
  $("#stream-button-container").show();
  $(".layout-btn").hide();
  $("#video-call-container").hide();
  $("#video-call").html("");
};

let toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    let micSvg = `<svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 512 512"
  >
    <path
      fill="currentColor"
      d="M256 328a96.108 96.108 0 0 0 96-96V112a96 96 0 0 0-192 0v120a96.108 96.108 0 0 0 96 96m-64-216a64 64 0 0 1 128 0v120a64 64 0 0 1-128 0Z"
    />
    <path
      fill="currentColor"
      d="M400 176v56c0 79.4-64.6 144-144 144s-144-64.6-144-144v-56H80v56c0 91.653 70.424 167.154 160 175.265V496h32v-88.735c89.576-8.111 160-83.612 160-175.265v-56Z"
    />
  </svg>`;
    $(e.target).text("Mic on");
    $(e.target).prepend(micSvg);
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
    let camSvg = `<svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 15 15"
  >
    <path
      fill="none"
      stroke="currentColor"
      d="M7 1.5H2m12.5 11v-8a1 1 0 0 0-1-1h-12a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1Zm-5-2a2 2 0 1 1 0-4a2 2 0 0 1 0 4Z"
    />
  </svg>`;
    $(e.target).text("Camera on");
    $(e.target).prepend(camSvg);
    $(e.target).css("background-color", "yellowgreen");
  } else {
    await localTracks[1].setMuted(true);
    $(e.target).text("Camera off");
    $(e.target).css("background-color", "#EE4B2B");
  }
};

// Placeholder functions for layout views
let setGridLayout = () => {
  console.log("SetGridLayout");
};
let setActiveSpeakerLayout = () => {
  console.log("SetActiveSpeakerLayout");
};

// User Event Handlers
$("#leave-btn").on("click", leaveAndRemoveLocalStream);
$("#mic-btn").on("click", toggleMic);
$("#camera-btn").on("click", toggleCamera);

// Event handlers for layout views
$("#grid-layout-btn").on("click", setGridLayout);
$("#active-speaker-layout-btn").on("click", setActiveSpeakerLayout);

/**
 * Step 1:
 * - Assign the user the role of host or audience based on what the user clicked.
 * - Join the user to the stream
 * - Next Step --> joinStream()
 */
$("#join-as-host-btn").on("click", async () => {
  await joinStream("publisher");
});

$("#join-as-audience-btn").on("click", async () => {
  await joinStream("audience");

});