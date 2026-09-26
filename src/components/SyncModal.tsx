import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import ModalShell from "./ModalShell";
import { useModal } from "../context/ModalContext";
import { useFinanceData } from "../hooks/useFinanceData";
import { exportFinanceData, importFinanceData } from "../utils/storage";

interface SyncModalProps {
    title: string;
}

const ID_PREFIX = "INEX-FIN-"
function SyncModal({ title }: SyncModalProps) {
    const { data } = useFinanceData();
    const { closeModal } = useModal();
    const peerRef = useRef<Peer | null>(null);
    const [mode, setMode] = useState<"send" | "receive">("send");
    const [peerId, setPeerId] = useState("");
    const [remotePeerId, setRemotePeerId] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => () => peerRef.current?.destroy(), []);

    function resetPeer() {
        peerRef.current?.destroy();
        peerRef.current = null;
        setPeerId("");
        setStatus("");
    }

    function startSending() {
        resetPeer();
        setStatus("Waiting for a request...");
        const shortPin = Math.floor(100000 + Math.random() * 900000).toString();
        const peer = new Peer(ID_PREFIX + shortPin);
        peerRef.current = peer;
        peer.on("open", setPeerId);
        peer.on("connection", (connection) => {
            connection.on("data", (message) => {
                if (message !== "REQUEST_DATA") return;
                connection.send(`data:${exportFinanceData(data)}`);
                setStatus("Finance data has been sent.");
            });
        });
        peer.on("error", (error) => setStatus(error.message));
    }

    function requestData() {
        if (!remotePeerId.trim()) {
            setStatus("Enter the sending device's peer ID.");
            return;
        }

        resetPeer();
        setStatus("Connecting...");
        const peer = new Peer();
        peerRef.current = peer;
        peer.on("open", () => {
            const connection = peer.connect(ID_PREFIX + remotePeerId.trim());
            connection.on("open", () => {
                setStatus("Requesting finance data...");
                connection.send("REQUEST_DATA"); //
            });
            connection.on("data", (message) => {
                if (typeof message !== "string" || !message.startsWith("data:")) {
                    setStatus("Received an unrecognized response.");
                    return;
                }

                try {
                    importFinanceData(message.slice("data:".length));
                    window.location.reload();
                } catch (error) {
                    setStatus(error instanceof Error ? error.message : "Unable to import finance data.");
                }
            });
            connection.on("error", (error) => setStatus(error.message));
        });
        peer.on("error", (error) => setStatus(error.message));
    }

    async function copyPeerId() {
        try {
            await navigator.clipboard.writeText(peerId.replace(ID_PREFIX, ""));
            setStatus("Peer ID copied.");
        } catch {
            setStatus("Could not copy the peer ID. Select and copy it manually.");
        }
    }

    return (
        <ModalShell title={title} onClose={closeModal}>
            <div className="sync-modal">
                <div aria-label="Transfer direction" className="sync-mode-switch" role="group">
                    <button aria-pressed={mode === "send"} className={`button ${mode === "send" ? "button-primary" : "button-secondary"}`} onClick={() => { resetPeer(); setMode("send"); }} type="button">
                        Send
                    </button>
                    <button aria-pressed={mode === "receive"} className={`button ${mode === "receive" ? "button-primary" : "button-secondary"}`} onClick={() => { resetPeer(); setMode("receive"); }} type="button">
                        Receive
                    </button>
                </div>
                {mode === "send" ? (
                    <section aria-label="Send finance data" className="sync-panel">
                        <div className="sync-copy">
                            <h3>Send finance data</h3>
                            <p>{peerId ? "Share this ID with the receiving device." : "Start sharing to generate an ID for the other device."}</p>
                        </div>
                        {peerId ? (
                            <div className="sync-peer-id">
                                <label htmlFor="sync-peer-id">Peer ID</label>
                                <div className="sync-peer-id-row">
                                    <input id="sync-peer-id" readOnly value={peerId.replace(ID_PREFIX, "")} />
                                    <button className="button button-secondary" onClick={copyPeerId} type="button">Copy ID</button>
                                </div>
                            </div>
                        ) : null}
                        {status && <p className="sync-status" role="status" aria-live="polite">{status}</p>}
                        <div className="sync-actions">
                            {peerId ? (
                                <button className="button button-secondary" onClick={resetPeer} type="button">Stop sharing</button>
                            ) : (
                                <button className="button button-primary" onClick={startSending} type="button">
                                    Start sharing
                                </button>
                            )}
                        </div>
                    </section>
                ) : (
                    <section aria-label="Receive finance data" className="sync-panel">
                        <div className="sync-copy">
                            <h3>Receive finance data</h3>
                            <p>Enter the peer ID shown on the sending device.</p>
                        </div>
                        <label className="sync-peer-id" htmlFor="sync-sender-id">Sender peer ID
                            <input id="sync-sender-id" onChange={(event) => setRemotePeerId(event.target.value)} value={remotePeerId} />
                        </label>
                        {status && <p className="sync-status" role="status" aria-live="polite">{status}</p>}
                        <div className="sync-actions">
                            <button className="button button-primary" onClick={requestData} type="button">Request data</button>
                        </div>
                    </section>
                )}
            </div>
        </ModalShell>
    )
}

export default SyncModal;