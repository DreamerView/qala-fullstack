import 'dotenv/config'
import app from './src/app.js'

const PORT = Number(process.env.APP_PORT || 3000)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})