import axios from "axios"

export async function sendMessage(req, res, next) {
  const { message } = req.body

  if (typeof message !== 'string') { return res.status(422).json({ error: 'Неверный синтаксис' }) }

  try {
    const responce = await axios.post(
      "https://api.airforce/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    )

    const answer = responce.data.choices[0].message.content

    if (answer === "Ratelimit Exceeded!\nPlease join: https://discord.gg/9g5wkVTn8s") { res.status(429).json({ error: 'Слишком много запросов' }) }

    res.status(200).send(answer)
  } catch (err) {
    next(err)
  }
}