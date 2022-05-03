import React, {useState, useEffect} from 'react';
import {firestore, db} from '../firebase/index';
import {ref, push, set, serverTimestamp, onValue, off} from 'firebase/database';
import {collection, doc, addDoc, getDoc} from 'firebase/firestore';
import {TextField} from '@mui/material';


export const Room = () => {
    const allRoomRef = collection(firestore, 'rooms');
    let roomRef;
    let tmproomName;
    const [isJoined, setIsJoined] = useState(false);
    const [roomName, setroomName] = useState('');
    const [roomId, setroomId] = useState('');
    const [messages, setMessages] = useState('');
    const [sendMessage, setSendMessage] = useState('');
    const [userName, setUserName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const messageRef = push(ref(db, 'rooms/' + roomId + '/messages/'), {
            userName: userName,
            msg: sendMessage,
            timeStamp: serverTimestamp()
        });
        setSendMessage('');
    };
    const ShowChat = () => {
        let result = [];
        if (messages === null) return;
        for (let [key, i] of Object.entries(messages)) {
            result.push(
                <tr key={key}>
                    <th>{i.userName}</th>
                    <td>{i.msg}</td>
                    <td>{new Date(i.timeStamp).toLocaleTimeString('ja-JP')}</td>
                </tr>
            )
        }
        return (<table>
            <tbody>{result}</tbody>
        </table>);

    }

    const Join = () => {
        if (userName === "" || roomName === "") {
            alert("ルーム名とユーザー名を入力してください")
            return
        }
        const CheckRoom = async () => {
            let Ref = await doc(allRoomRef, roomName);
            let docSnap = await getDoc(Ref);
            if (!docSnap.exists()) {
                let Id = await CreateRoom();
                setroomId(Id)
                return Id
            } else {
                setroomId(roomName)
                return roomName
            }
        }


        const CreateRoom = async () => {
            let res = await addDoc(allRoomRef, {Name: roomName});
            setroomId(res.id);
            await set(ref(db, 'rooms/' + res.id), {messages: ""});
            console.log(res.id);
            return res.id
        }
        const SetRoom = async (roomId) => {
            roomRef = await doc(allRoomRef, roomId);
            await addDoc(collection(roomRef, "/members/"), {
                name: userName
            });
        }

        const JoinRoom = async () => {
            let id = await CheckRoom();
            await SetRoom(id);
            return id;
        }

        JoinRoom().then((id) => {
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
        const Ref = ref(db, 'rooms/' + roomId + '/messages');
        off(Ref);
        setIsJoined(false);
    }

    return (
        <div>
            <div>
                <TextField
                    value={roomName}
                    onChange={(e) => {
                        tmproomName = e.target.value;
                        setroomName(e.target.value);
                    }}
                    label='ルーム名'
                    variant='filled' disabled={isJoined}
                ></TextField>
                <TextField value={userName} disabled={isJoined}
                           label='ユーザー名'
                           onChange={(e) => setUserName(e.target.value)}
                           variant='filled'></TextField>
                {isJoined ? <button onClick={Left}>Left</button> : <button onClick={Join}>Join</button>}
            </div>
            {isJoined ? <>


                <div>
                    <TextField value={sendMessage}
                               onChange={(e) => {
                                   setSendMessage(e.target.value);

                               }}
                               variant='filled'></TextField>
                    <button onClick={handleSubmit}>Submit</button>
                </div>
                <div><p>この部屋のID: {roomId}</p></div>
                <ShowChat></ShowChat></> : <></>}

        </div>
    );
};

export default Room;
