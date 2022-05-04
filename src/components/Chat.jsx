import React, {useEffect, useRef, useState} from 'react';
import {useCookies} from 'react-cookie';
import {firestore, db, storage} from '../firebase/index';
import {ref as storageRef} from 'firebase/storage'
import {ref, push, set, serverTimestamp, onValue, off} from 'firebase/database';
import {collection, doc, addDoc, getDoc, onSnapshot, updateDoc, deleteDoc} from 'firebase/firestore';
import {TextField, Button, IconButton, InputAdornment} from '@mui/material';
import {Send} from '@mui/icons-material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'
import DrawZone from "./DrawZone";
import {uploadString} from "firebase/storage";

const GameState = {//enum風
    WAIT_MORE_MEMBER: "waitMember",//独りぼっち　さみしい

    WAIT_START: "waitStart",//スタート待ち
    DRAW: "draw",//お絵描き中、画像アップロード待ち
    CHAT: "chat",//話し合い中
    CHECK_ANSWER: "checkAnswer",//答え合わせ
    RESULT: "result",//結果ー＞goto DRAW or END

    END: "end"//ゲーム終了
}

export const Room = () => {
    const allRoomRef = collection(firestore, 'rooms');
    const gameState = useRef/*<GameState>*/("");
    const painter = useRef('');
    const [isJoined, setIsJoined] = useState(false);
    const [roomName, setroomName] = useState('');
    const roomId = useRef('');
    const userId = useRef('');
    const [messages, setMessages] = useState('');
    const [sendMessage, setSendMessage] = useState('');
    const [userName, setUserName] = useState('');
    const [cookie, setCookie, removeCookie] = useCookies();
    const [userDictionary, setUserDictionary] = useState({});
    const firestoreListenersRef = useRef([]);
    const [isCopied, setIsCopied] = useState(false);

    const roomRef=useRef();
    const isPainter = painter.current === userId.current && painter.current !== ""
    const SetRoomID = (value) => {
        roomId.current = value
        setCookie("roomId", value)
    }
    const SetUserId = (value) => {
        userId.current = value
        setCookie("userId", value)
    }
    useEffect(() => {//Cookieの管理 Cookieがあれば入り直す
        if (cookie.userId && cookie.roomId) {
            roomId.current =
                cookie.roomId
            userId.current = cookie.userId
            Join()
        }
    }, []);
    //ゲームの進行状態を監視
    useEffect(() => {
        console.log(gameState.current)
        switch (gameState.current) {
            case GameState.WAIT_MORE_MEMBER: {
                break;
            }
            case GameState.WAIT_START: {
                break;
            }
            case GameState.DRAW: {
                break;
            }
            case GameState.CHAT: {
                break;
            }
            case GameState.CHECK_ANSWER: {
                break;
            }
            case GameState.RESULT: {
                break;
            }
            case GameState.END: {
                break;
            }
            default :
                break;
        }
    }, [gameState.current])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const messageRef = push(ref(db, 'rooms/' + roomId.current + '/messages/'), {
            userId: userId.current,
            msg: sendMessage,
            timeStamp: serverTimestamp()
        });
        setSendMessage('');
    };

    const Checked = async () => {
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false)
        }, 1000)
    }
    const ShowChat = () => {
        let result = [];
        if (messages === "") return;
        for (let [key, i] of Object.entries(messages)) {
            result.push(
                <tr key={key}>
                    <th>{userDictionary[i.userId] || "Unknown太郎"}</th>
                    <td>{i.msg}</td>
                    <td>{new Date(i.timeStamp).toLocaleTimeString('ja-JP')}</td>
                </tr>
            )
        }
        return (<table>
            <tbody>{result}</tbody>
        </table>);

    }
    const SetGameStateAsync = async (state) => {
        console.log(state)
        console.log(roomRef)
        await updateDoc(roomRef.current, {State: state}).then(() => {
            //setGameState(state)
        });
    }
    const Join = () => {

        let createSelf = false;
        if ((userName === "" || roomName === "") && (!cookie.userId && !cookie.roomId)) {
            alert("ルーム名かユーザー名を入力してください")
            return
        }
        const CheckRoom = async () => {//Cookieから取り出す
            let rN = roomName;
            if (rN === '') {
                rN = roomId.current
            }
            let Ref = await doc(allRoomRef, rN);
            let docSnap = await getDoc(Ref);
            if (!docSnap.exists()) {
                let Id = await CreateRoom();
                SetRoomID(Id);
                return Id
            } else {
                const State = docSnap.data().State;
                if (State === GameState.WAIT_MORE_MEMBER || State === GameState.WAIT_START) {

                    SetRoomID(rN);

                    return rN
                }

                return ""
            }
        }


        const CreateRoom = async () => {
            let res = await addDoc(allRoomRef, {Name: roomName});
            SetRoomID(res.id);
            await set(ref(db, 'rooms/' + res.id), {messages: ""});
            console.log(res.id);
            createSelf = true;
            return res.id;
        }
        const SetRoom = async (roomId) => {

            console.log(roomId)
            roomRef.current = await doc(allRoomRef, roomId);
            if (cookie === null || cookie === "" || !Object.keys(cookie).length) {
                const userRef = await addDoc(collection(roomRef.current, "/members/"), {
                    name: userName
                });
                SetUserId(userRef.id)
            }
            if (createSelf) {//自分が作成者ならPainterを自分に
                await updateDoc(roomRef.current, {Painter: userId.current});
                painter.current = userId.current;
            }

        }

        const JoinRoom = async () => {
            let id = await CheckRoom();
            if (id === "") {
                return "";
            }
            await SetRoom(id);
            return id;
        }

        JoinRoom()
            .then((id) => {
                if (id === "") {
                    alert("待機状態でなかったため、入れませんでした")
                    return
                }
                const roomDoc = doc(allRoomRef, id)//Not
                const q = collection(roomDoc, "/members/");

                firestoreListenersRef.current.push(
                    onSnapshot(roomDoc, {
                        next: (doc) => {
                            const data = doc.data()
                            console.log(data);
                            gameState.current = data.State;
                            painter.current = (data.Painter);
                        }
                    })
                );
                firestoreListenersRef.current.push(
                    onSnapshot(q, {
                        next: (querySnapshot) => {
                            let tmp = {}
                            querySnapshot.forEach((doc) => {

                                console.log(doc.id)
                                console.log(doc.data())
                                tmp[doc.id] = doc.data().name
                            });
                            setUserDictionary(tmp)

                            const Alone = async () => {
                                if (painter.current !== userId.current) {
                                    await updateDoc(roomRef.current, {Painter: userId.current}).then(() => {
                                        //setPainter(userId.userId)
                                    });
                                }
                                await SetGameStateAsync(GameState.WAIT_MORE_MEMBER);
                            }


                            if (Object.keys(tmp).length <= 1) {
                                Alone()//独りぼっちならPainterを自分にかつ状態をWAIT_MORE_MEMBERに
                            } else {
                                if (gameState.current === GameState.WAIT_MORE_MEMBER && painter.current === userId.current) {
                                    SetGameStateAsync(GameState.WAIT_START);
                                }

                            }
                        }
                    })
                );
                JoinChat(id);
                setIsJoined(true);
            })

        const JoinChat = (id) => {
            const chatRef = ref(db, 'rooms/' + id + '/messages');
            onValue(chatRef, (snapshot) => {
                console.log(snapshot.val());
                let selfmessages = snapshot.val();
                setMessages(selfmessages);
            })
        }


    };
    const Left = () => {
        deleteDoc(doc(allRoomRef, roomId.current + "/members/" + userId.current)).then(() => {
            const Ref = ref(db, 'rooms/' + roomId.current + '/messages');
            off(Ref);
            firestoreListenersRef.current.forEach((l) => {
                l();
            });
            removeCookie("userId");
            removeCookie("roomId");
            setIsJoined(false);
        });
    }

    return (
        <div>
            <div>
                <TextField
                    disabled={isJoined}
                    value={roomName}
                    onChange={(e) => {
                        setroomName(e.target.value);
                    }}
                    label='ルーム名/ID'
                    variant='filled'
                ></TextField>
                <TextField value={userName} disabled={isJoined}
                           label='ユーザー名'
                           onChange={(e) => setUserName(e.target.value)}
                           variant='filled'></TextField>
                {isJoined ? <Button variant="contained" color="error" onClick={Left}>Left</Button> :
                    <Button variant="contained" onClick={Join}>Join</Button>}
            </div>
            {isJoined ? <>


                <div>
                    <TextField value={sendMessage}
                               onChange={(e) => {
                                   setSendMessage(e.target.value);
                               }}
                               variant='filled' InputProps={{
                        endAdornment:
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleSubmit}
                                    edge="end"
                                    color="primary"
                                    disabled={sendMessage === ""}
                                >
                                    {<Send/>}
                                </IconButton>
                            </InputAdornment>
                    }}></TextField>
                </div>
                <div><span>この部屋のID: {roomId.current}
                    <IconButton aria-label="copy" onClick={() => {
                        navigator.clipboard.writeText(roomId.current)
                        Checked();
                    }}> {!isCopied ? <ContentCopyIcon/> : <CheckIcon/>}</IconButton></span></div>
                <ShowChat></ShowChat></> : <></>}
            {isPainter &&
                <DrawZone penRadius={5} odai={"くるま！！！！"} onDrawEnd={(imageDataUrl) => {

                    const storageReference = storageRef(storage, roomId.current + '.jpg');
                    // Data URL string
                    uploadString(storageReference, imageDataUrl, 'data_url').then((snapshot) => {
                        SetGameStateAsync(GameState.CHAT);
                    });
                }
                }/>
            }

        </div>
    );
};

export default Room;
