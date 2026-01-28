import axios from 'axios'

const url = 'http://localhost:4000/messages'

async function sendMessage(message: string) {
  try {
    const result = await axios.post(`${url}/sendMessage`, { message: message })
    return {
      data: result.data,
      status: 200,
    }
  } catch (err) {
    let status = 500
    let messageText = 'Сервер оффлайн'

    if (axios.isAxiosError(err)) {
      if (err.response) {
        status = err.response.status
        messageText = err.response.data?.error || err.message
      } else {
        messageText = err.message
      }
    } else if (err instanceof Error) {
      messageText = err.message
    }

    console.log(err)

    return {
      data: null,
      title: `Не удалось выполнить запрос`,
      message: messageText,
      status,
    }
  }
}

export { sendMessage }