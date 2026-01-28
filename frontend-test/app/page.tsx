"use client"

import { useState, useEffect, useRef } from "react"
import { Clear, Mircophone, Send } from "./assets/Icons"
import { sendMessage } from "./api/serverApi"
import { useMessageStore } from "./stores/messagesStore"

interface Message {
  text: string
  type: boolean
}

export default function Home() {
  const [input, setInput] = useState<string>("")
  const [listening, setListening] = useState<boolean>(false)
  const messageStore = useMessageStore()

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) { return }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.lang = "ru-RU"
    recognition.interimResults = false
    console.log(recognition)
    recognition.onresult = (event:any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }

    recognition.onend = () => setListening(false)

    recognition.onerror = (event:any) => {
      console.error("Ошибка записи голоса", event.error)
      setListening(false)
    }

    recognitionRef.current = recognition

    return () => { recognition.stop() }
  }, [])

  const startListening = () => {
    if (!recognitionRef) { return }
    setListening(true)
    recognitionRef.current.start()
  }

  const stopListening = () => {
    if (!recognitionRef.current) { return }
    recognitionRef.current.stop()
    setListening(false)
  }

  async function sendToServer() {
    if (!input.trim()) { return }
    const response = await sendMessage(input)
    console.log(response)
    if (response.status === 200) {
      messageStore.addMessage({text: input, type: false})
      messageStore.addMessage({text: response.data, type: true})
      setInput("")
    } else {
      switch (response.status) {
        case 400:
          alert("Неверный формат данных")
          break
        case 404:
          alert("Страница не найдена")
          break
        case 422:
          alert("Неверный формат данных")
          break
        case 429:
          alert("Превышен лимит запросов, повторите позже")
          break
        case 500:
          alert("Ошибка сервера, попробуйте позже")
          break
      }
    }
  }

  return (
    <div className="h-screen w-screen p-[1%_25%] flex flex-col items-left justify-between">
      <div className="w-full min-w-0 [--thread-content-max-width:50rem] max-w-(--thread-content-max-width) mx-auto flex flex-col items-left sticky top-0 z-10">
        <div className="w-full flex justify-between">
          <label className="text-[1.5rem]">Здравствуйте!</label>
          <button
            className="ml-[10px] text-[#4480AE] hover:text-[#71A2C7] transition-colors"
            onClick={() => {
              if (confirm("Вы уверены, что хотите очистить чат?")) { messageStore.clearChat() }
            }}>
            <Clear className="w-7 h-7 cursor-pointer"/>
          </button>
        </div>
        <label className="text-[2rem]">Что бы вы хотели узнать?</label>
      </div>
      <div className="w-full min-w-0 [--thread-content-max-width:50rem] max-w-(--thread-content-max-width) mx-auto flex-1 flex-col overflow-y-auto custom-scroll">
        {messageStore.messages.map((message: Message, index: number) => {
          const marginClass = message.type ? "m-[13px_10%_13px_0%]" : "m-[13px_0%_13px_10%]"
          const colorClass = message.type ? "bg-[#073050]" : "bg-[#0D436D]"
          const roundedClass = message.type ? "rounded-[13px_13px_13px_0px]" : "rounded-[13px_13px_0px_13px]"
          return (
            <div
              key={index}
              className={`w-9/10 p-[10px] ${marginClass} ${colorClass} border border-[#073050] ${roundedClass} text-justify whitespace-pre-wrap`}>
              <label>{message.text}</label>
            </div>
          )
        })}
      </div>
      <div className="w-full min-w-0 [--thread-content-max-width:50rem] max-w-(--thread-content-max-width) mx-auto p-[0px_10px] flex bg-[#073050] border-2 border-[#6898BC] rounded-[13px] overflow-hidden sticky bottom-0 z-10">
        <button
          className="mr-[10px] text-[#4480AE] hover:text-[#71A2C7] transition-colors"
          onClick={listening ? stopListening : startListening}>
          <Mircophone className="w-7 h-7 cursor-pointer"/>
        </button>
        <input
          className="w-full p-[10px] bg-[#06243B] text-[1rem] focus:outline-none"
          placeholder="Спросите все что хотите"
          value={input}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              sendToServer()
            }
          }}
          onChange={(e)=>setInput(e.target.value)}/>
        <button
          className="ml-[10px] text-[#4480AE] hover:text-[#71A2C7] transition-colors"
          onClick={()=>sendToServer()}>
          <Send className="w-7 h-7 cursor-pointer"/>
        </button>
      </div>
    </div>
  )
}
