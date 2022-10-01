import { useEffect, useRef, useState } from "react";
import styles from "../styles/Chat.module.css";

const MESSAGE_TYPE = {
    SDP: "SDP",
    CANDIDATE: "CANDIDATE",
};

export default function Chat() {
    // const selfRef = useRef({ srcObject: null });
    // const selfVideoRef = useRef({ srcObject: null });
    // const remoteRef = useRef({ srcObject: null });
    // const remoteVideoRef = useRef({ srcObject: null });

    const selfRef = useRef({ srcObject: null });
    const remoteRef = useRef({ srcObject: null });

    // console.log("self", selfRef.current);
    // console.log("remote", remoteRef.current);

    async function sendSignal(signaling, message, retries = 3) {
        if (!retries > 0) {
            throw new Error("Failed To Connect Signaling Server");
        }

        setTimeout(() => {
            console.log(
                `${retries} times left to retry to connect signal server.`
            );
            if (signaling.readyState === 1) {
                return signaling.send(message);
            } else {
                sendSignal(signaling, message, retries - 1);
            }
        }, 1000);
    }

    async function startChat() {
        try {
            const stream = await window.navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            const signaling = new WebSocket("wss://penguin-chat.onrender.com");
            // const signaling = new WebSocket("ws://localhost:8080");
            const peerConnection = createPeerConnection(signaling);

            // console.log(peerConnection);

            addMessageSignalHandler(signaling, peerConnection);

            stream
                .getTracks()
                .forEach((track) => peerConnection.addTrack(track, stream));
            selfRef.current.srcObject = stream;
        } catch (e) {
            console.error(e);
        }
    }

    function createPeerConnection(signaling) {
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:openrelay.metered.ca:80" }],
        });

        peerConnection.onnegotiationneeded = async () => {
            console.log("onnegotiationneeded");
            await createAndSendOffer(signaling, peerConnection);
        };

        peerConnection.onicecandidate = (iceEvent) => {
            console.log("onicecandidate", iceEvent);
            if (iceEvent && iceEvent.candidate) {
                const message = JSON.stringify({
                    message_type: MESSAGE_TYPE.CANDIDATE,
                    content: iceEvent.candidate,
                });
                sendSignal(signaling, message);
            }
        };

        peerConnection.ontrack = (event) => {
            console.log("ontrack", event);
            console.log(remoteRef);
            if (!remoteRef.current.srcObject) {
                remoteRef.current.srcObject = event.streams[0];
            }
        };

        return peerConnection;
    }

    async function createAndSendOffer(signaling, peerConnection) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        const message = JSON.stringify({
            message_type: MESSAGE_TYPE.SDP,
            content: offer,
        });
        sendSignal(signaling, message);
    }

    function addMessageSignalHandler(signaling, peerConnection) {
        signaling.onmessage = async (message) => {
            const data = JSON.parse(message.data);
            console.log("message_data", data);
            console.log("message type", data?.message_type);
            if (!data) return;

            const { message_type, content } = data;

            try {
                if (message_type === MESSAGE_TYPE.CANDIDATE && content) {
                    await peerConnection.addIceCandidate(content);
                } else if (message_type === MESSAGE_TYPE.SDP) {
                    if (content?.type === "offer") {
                        await peerConnection.setRemoteDescription(content);
                        const answer = await peerConnection.createAnswer();
                        await peerConnection.setLocalDescription(answer);

                        const messageSignal = JSON.stringify({
                            message_type: MESSAGE_TYPE.SDP,
                            content: answer,
                        });
                        sendSignal(signaling, messageSignal);
                    } else if (content?.type === "answer") {
                        await peerConnection.setRemoteDescription(content);
                    } else {
                        console.log("Unsupported SDP Type");
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };
    }

    // useEffect(() => {
    // async function askMediaPermission() {
    //     const streaming = await window.navigator.mediaDevices.getUserMedia({
    //         audio: true,
    //         video: false,
    //     });

    //         console.log(streaming);
    //         setStream(streaming);
    //     }

    //     // askMediaPermission();
    // }, []);

    return (
        <div className={styles.container}>
            {/* <div className={styles.messageBox}></div> */}
            <button onClick={() => startChat()}>Start Chat</button>

            <video className={styles.selfVideo} ref={selfRef} autoPlay></video>
            <video
                className={styles.remoteVideo}
                ref={remoteRef}
                autoPlay
            ></video>

            {/* <audio ref={selfRef} controls autoPlay></audio>
            <audio ref={remoteRef} controls autoPlay></audio> */}
        </div>
    );
}
