import React, {forwardRef, useCookies} from 'react';
import './../App.css';
import useCacheState from '../CacheState'

const [Cookies, setCookies, removeCookies] = useCookies();
const [getRoomID, setRoomId, stateRoomId] = useCacheState('');

// Ex: <Balloon />だけで多分動く
const Balloon = forwardRef((props, ref) => {

  return (<></>);
})