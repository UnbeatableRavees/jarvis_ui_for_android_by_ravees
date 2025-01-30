import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Input } from "/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card"
import { Button } from "/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "/components/ui/avatar"
import { Play, Home, Search, Menu, Clock, Calendar, Cloud, Globe, Network, Newspaper, Camera } from "lucide-react"
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import axios from 'axios'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'

export default function JarvisUI() {
  const [userInput, setUserInput] = useState('')
  const [responses, setResponses] = useState<string[]>([])
  const [weather, setWeather] = useState<string | null>(null)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)

  const { transcript, resetTranscript, listening } = useSpeechRecognition()

  useEffect(() => {
    if (!listening) {
      SpeechRecognition.startListening({ continuous: true })
    }

    if (transcript) {
      handleCommandSubmit(transcript)
      resetTranscript()
    }
  }, [transcript, listening, resetTranscript])

  useEffect(() => {
    speak('Hello, how can I assist you today?')
    fetchWeather()
    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        setBatteryLevel(battery.level * 100)
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(battery.level * 100)
        })
      })
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value)
  }

  const handleCommandSubmit = (command: string) => {
    const response = executeCommand(command)
    setResponses([...responses, `You: ${command}`, `Jarvis: ${response}`])
    speak(response)
    setUserInput('')
  }

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    speechSynthesis.speak(utterance)
  }

  const executeCommand = (command: string): string => {
    const lowerCaseCommand = command.toLowerCase().trim()
    switch (lowerCaseCommand) {
      case 'hello': return 'Hi there! How can I assist you today?'
      case 'time': return new Date().toLocaleTimeString()
      case 'date': return new Date().toLocaleDateString()
      case 'ip address': return `Your IP address is: ${window.location.hostname}`
      case 'news': return fetchNews()
      case 'weather': return fetchWeather()
      case 'open google': window.open('https://www.google.com', '_blank'); return 'Opening Google...'
      case 'play music': return 'Playing music...'
      case 'take screenshot': takeScreenshot(); return 'Taking screenshot...'
      default: return 'Command not recognized.'
    }
  }

  const fetchNews = async () => {
    try {
      const response = await axios.get('https://newsapi.org/v2/top-headlines?country=in&apiKey=YOUR_NEWS_API_KEY')
      const articles = response.data.articles.slice(0, 3).map((article: any) => article.title).join('. ')
      const newsResponse = `Here are the top news headlines: ${articles}`
      setResponses(prev => [...prev, `Jarvis: ${newsResponse}`])
      speak(newsResponse)
      return newsResponse
    } catch (error) {
      console.error('Error fetching news:', error)
      return 'Error fetching news.'
    }
  }

  const fetchWeather = async () => {
    try {
      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=YOUR_OPENWEATHERMAP_API_KEY&units=metric')
      const weatherData = `The weather in Delhi is ${response.data.weather[0].description} with a temperature of ${response.data.main.temp}°C.`
      setWeather(weatherData)
      setResponses(prev => [...prev, `Jarvis: ${weatherData}`])
      speak(weatherData)
      return weatherData
    } catch (error) {
      console.error('Error fetching weather:', error)
      return 'Error fetching weather.'
    }
  }

  const takeScreenshot = () => {
    html2canvas(document.body).then(canvas => {
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = 'screenshot.png'
      link.click()
    })
  }

  return (
    <motion.div className="w-full min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-full max-w-3xl mx-auto bg-gray-800 text-white">
        <CardHeader>
          <Avatar>
            <AvatarImage src="https://robohash.org/jarvis?set=set2&bgset=bg2&size=180x180" />
            <AvatarFallback>J</AvatarFallback>
          </Avatar>
          <CardTitle>Jarvis</CardTitle>
        </CardHeader>
        <CardContent>
          <div>{responses.map((response, index) => (
            <motion.div key={index}>{response}</motion.div>
          ))}</div>
          <Input value={userInput} onChange={handleInputChange} placeholder="Type a command..." />
          <Button onClick={() => handleCommandSubmit(userInput)}>Send</Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
