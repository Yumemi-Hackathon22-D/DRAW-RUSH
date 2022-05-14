import { useRef } from 'react'

export const Sounds = {
    Notification1: "/sounds/notification1.wav",
    NotificationSimple: "/sounds/notification_simple.wav",
}
export default function useSound(initialPath) {
    const audio = useRef(new Audio(initialPath))
    const play = (path) => {
        if (path) load(path);
        audio.current.play();
    }
    const load = (path) => {
        audio.current.src = path;
        audio.current.load();
    }
    return [play, load]
}