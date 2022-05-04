import React, {forwardRef, useImperativeHandle, useState} from 'react';
import './../App.css';
import useCacheState from '../CacheState'

// const [Cookies, setCookies, removeCookies] = useCookies();
// const [getRoomID, setRoomId, stateRoomId] = useCacheState('');

// Ex: <Balloon message={msg}/>
const Balloon = forwardRef((props, messageRef) => {
  let balloons = {};  
  const [userDictionary, setUserDictionary] = useState({});

  useImperativeHandle(messageRef, () =>{
      return {
        addBalloon(props) {
          showBalloon(props);
        },
        syncUsers (users) {
          setUserDictionary(users);
        }
      }
    })
    const showBalloon = (msg) => {
      let sender = userDictionary[msg.userId];
      let content = msg.msg;
      return (
        <div><div className="fukidasi fukidasi.right">{content}</div> <p>{sender}</p></div>
      )
    }
    return(
      <div>{balloons}</div>
    );
})

export default Balloon;