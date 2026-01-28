import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Message = {
  text: string,
  type: boolean,
}

interface MessageStore {
  messages: Message[],
  addMessage: (data:Message) => void,
  clearChat: () => void,
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) => set((state) => (
        { messages: [...state.messages, message] }
      )),
      clearChat: () => set({ messages: [] })
    }),
    { name: "messages" }
  )
)