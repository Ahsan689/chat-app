import React, {useState, useEffect, useRef} from 'react'
import queryString from 'query-string'
import io from 'socket.io-client';
import {useLocation} from 'react-router-dom'

import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';

import './Chat.css'

const ENDPOINT = 'https://chat-app-server-nine.vercel.app/';
// const ENDPOINT = 'http://localhost:5000';

const Chat = () => {

  const location = useLocation()

  // ? The Reason For USing useRef Hook
  // Assignments to the 'socket' variable from inside React Hook useEffect will be lost after each render. To preserve the value over time, store it in a useRef Hook and keep the mutable value in the '.current' property. Otherwise, you can move this variable directly inside useEffect  

  let socket = useRef(null);

  console.log(socket,"socket");

  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])


  useEffect(() => {

    const {name, room} = queryString.parse(location.search)
    // console.log(name,room);
    socket.current = io(ENDPOINT,{
      transports: ["websocket"] // use webSocket only
    });

    setName(name)
    setRoom(room)

    socket.current.emit('join', {name, room}, (error) => {
      alert(error)
    })

    return () =>{
      socket.current.on('disconnect')

      socket.current.off()
    }

  },[location.search])

  useEffect(() => {

    socket.current.on('message', (message) => {
      setMessages([...messages,message])
    })

    socket.current.on("roomData", ({ users }) => {
      setUsers(users);
    });
   
  }, [messages])

  const sendMessage = (event) => {
    event.preventDefault();

    if(message) {
      socket.current.emit('sendMessage', message, () => setMessage(''));
    }
  }

  console.log(messages,"messa");
  

  return (
    // <h1>Chat</h1>
    <div className="outerContainer">
      <div className="container">
          <InfoBar room={room} />
          <Messages messages={messages} name={name} />
          <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
      <TextContainer users={users}/>
    </div>
  )
}

export default Chat